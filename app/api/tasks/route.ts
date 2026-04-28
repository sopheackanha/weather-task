import { NextRequest, NextResponse } from "next/server";
import { readTasks, createTask, getTasksByDate } from "@/lib/taskStorage";
import { Priority, Status, WeatherCondition } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const tasks = date ? getTasksByDate(date) : readTasks();
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, date, priority, status, weatherCondition } = body;

  if (!title?.trim() || !date) {
    return NextResponse.json({ error: "title and date are required" }, { status: 400 });
  }

  const task = createTask(
    {
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      date: String(date),
      priority: (priority as Priority) || "medium",
      status: (status as Status) || "todo",
    },
    weatherCondition as WeatherCondition | undefined
  );

  return NextResponse.json({ task }, { status: 201 });
}
