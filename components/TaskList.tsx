"use client";

import { useState } from "react";
import { Task, WeatherData, WeatherTheme } from "@/lib/types";
import TaskCard from "./TaskCard";
import MiniCalendar from "./MiniCalendar";
import { Plus, ClipboardList, AlertTriangle, CloudRain } from "lucide-react";

interface Props {
  date: Date;
  tasks: Task[];
  allTasks: Task[];
  loading: boolean;
  weather: WeatherData | null;
  theme: WeatherTheme;
  datesWithTasks: Set<string>;
  onDateChange: (date: Date) => void;
  onAddTask: () => void;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (id: string) => void;
}

type Filter = "all" | "todo" | "in-progress" | "done" | "outdoor" | "indoor";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TaskList({
  date, tasks, allTasks, loading, weather, theme,
  datesWithTasks, onDateChange, onAddTask, onTaskUpdated, onTaskDeleted
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "outdoor") return t.locationType === "outdoor";
    if (filter === "indoor") return t.locationType === "indoor";
    return t.status === filter;
  });

  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const outdoorWarningCount = tasks.filter((t) => t.weatherWarning).length;
  const hasBadWeather = weather && !weather.isGoodForOutdoor;

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: `0 8px 40px rgba(0,0,0,0.08)`,
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "todo", label: "Todo" },
    { key: "in-progress", label: "Active" },
    { key: "done", label: "Done" },
    { key: "outdoor", label: "🌳 Outdoor" },
    { key: "indoor", label: "🏠 Indoor" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Mini Calendar column */}
      <div className="lg:col-span-4">
        <MiniCalendar
          selectedDate={date}
          onDateChange={onDateChange}
          datesWithTasks={datesWithTasks}
          theme={theme}
        />
      </div>

      {/* Tasks column */}
      <div className="lg:col-span-8 rounded-3xl p-5 sm:p-6 animate-fade-in" style={cardStyle}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.textSecondary }}>
              {date.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
            <h2 className="font-display text-3xl font-bold" style={{ color: theme.textPrimary }}>
              {date.getDate()}{" "}
              <span style={{ color: theme.accent }}>{MONTHS[date.getMonth()]}</span>
            </h2>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: theme.accent, color: "#fff" }}
          >
            <Plus size={15} />
            New Task
          </button>
        </div>

        {/* Weather warning banner */}
        {hasBadWeather && outdoorWarningCount > 0 && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-4 warning-pulse"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-600">
                {outdoorWarningCount} outdoor task{outdoorWarningCount > 1 ? "s" : ""} affected by {weather?.condition} weather
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                Consider rescheduling these tasks or moving them indoors.
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: theme.textSecondary }}>
              <span>{done}/{total} completed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `rgba(${theme.accentRgb}, 0.15)` }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: theme.accent }}
              />
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div
          className="flex gap-1 mb-5 rounded-xl p-1"
          style={{ background: `rgba(${theme.accentRgb}, 0.08)` }}
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all duration-150 whitespace-nowrap"
              style={{
                background: filter === f.key ? theme.cardBg : "transparent",
                color: filter === f.key ? theme.textPrimary : theme.textSecondary,
                boxShadow: filter === f.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl animate-pulse" style={{ background: `rgba(${theme.accentRgb}, 0.08)` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <ClipboardList size={36} className="mb-3 opacity-30" style={{ color: theme.textSecondary }} />
            <p className="font-display text-lg font-semibold" style={{ color: theme.textSecondary }}>
              {filter === "all" ? "No tasks for this day" : `No ${filter} tasks`}
            </p>
            {filter === "all" && (
              <button
                onClick={onAddTask}
                className="mt-4 text-sm font-semibold hover:underline"
                style={{ color: theme.accent }}
              >
                + Add your first task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task, i) => (
              <div key={task.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-slide-up">
                <TaskCard
                  task={task}
                  theme={theme}
                  onUpdated={onTaskUpdated}
                  onDeleted={onTaskDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
