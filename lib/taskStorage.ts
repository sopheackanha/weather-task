import fs from "fs";
import path from "path";
import { Task, Priority, Status, LocationType } from "./types";
import { detectLocationType, hasWeatherWarning } from "./taskIntelligence";
import type { WeatherCondition } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
}

export function readTasks(): Task[] {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8")) as Task[];
}

export function writeTasks(tasks: Task[]) {
  ensureDataDir();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export function getTasksByDate(date: string): Task[] {
  return readTasks().filter((t) => t.date === date);
}

export function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt" | "locationType" | "weatherWarning">,
  currentCondition?: WeatherCondition
): Task {
  const { v4: uuidv4 } = require("uuid");
  const now = new Date().toISOString();
  const locationType = detectLocationType(data.title, data.description);
  const weatherWarning = currentCondition
    ? hasWeatherWarning(locationType, currentCondition)
    : false;

  const task: Task = {
    ...data,
    id: uuidv4(),
    locationType,
    weatherWarning,
    createdAt: now,
    updatedAt: now,
  };
  const tasks = readTasks();
  tasks.push(task);
  writeTasks(tasks);
  return task;
}

export function updateTask(id: string, data: Partial<Task>): Task | null {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
  writeTasks(tasks);
  return tasks[idx];
}

export function deleteTask(id: string): boolean {
  const tasks = readTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  writeTasks(filtered);
  return true;
}

// Recalculate weather warnings for all tasks of a given date
export function refreshWeatherWarnings(date: string, condition: WeatherCondition) {
  const tasks = readTasks();
  let changed = false;
  for (const t of tasks) {
    if (t.date !== date) continue;
    const warning = hasWeatherWarning(t.locationType, condition);
    if (t.weatherWarning !== warning) {
      t.weatherWarning = warning;
      t.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) writeTasks(tasks);
}
