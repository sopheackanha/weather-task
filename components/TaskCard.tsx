"use client";

import { useState } from "react";
import { Task, Priority, Status, WeatherTheme } from "@/lib/types";
import { Check, Trash2, ChevronDown, ChevronUp, AlertTriangle, TreePine, Home, Minus } from "lucide-react";

interface Props {
  task: Task;
  theme: WeatherTheme;
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string; dot: string }> = {
  low: { bg: "rgba(16,185,129,0.12)", text: "#059669", dot: "#10B981" },
  medium: { bg: "rgba(245,158,11,0.12)", text: "#D97706", dot: "#F59E0B" },
  high: { bg: "rgba(239,68,68,0.12)", text: "#DC2626", dot: "#EF4444" },
};

const LOCATION_ICONS = {
  outdoor: <TreePine size={11} />,
  indoor: <Home size={11} />,
  either: <Minus size={11} />,
};

export default function TaskCard({ task, theme, onUpdated, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDone = task.status === "done";
  const pri = PRIORITY_COLORS[task.priority];
  const isWarning = task.weatherWarning && !isDone;

  const patch = async (data: Partial<Task>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      onUpdated(d.task);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setLoading(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted(task.id);
    setLoading(false);
  };

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.005]"
      style={{
        background: isWarning
          ? "rgba(239,68,68,0.07)"
          : isDone
          ? `rgba(${theme.accentRgb}, 0.04)`
          : `rgba(${theme.accentRgb}, 0.06)`,
        border: isWarning
          ? "1px solid rgba(239,68,68,0.3)"
          : `1px solid ${theme.border}`,
        opacity: isDone ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => patch({ status: isDone ? "todo" : "done" })}
          disabled={loading}
          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
          style={{
            background: isDone ? theme.accent : "transparent",
            borderColor: isDone ? theme.accent : theme.border,
          }}
        >
          {isDone && <Check size={11} strokeWidth={3} className="text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Warning badge */}
              {isWarning && (
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle size={11} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                    Weather Warning — Reschedule?
                  </span>
                </div>
              )}
              <p
                className="text-sm font-medium leading-snug truncate"
                style={{
                  color: theme.textPrimary,
                  textDecoration: isDone ? "line-through" : "none",
                }}
              >
                {task.title}
              </p>
            </div>

            {/* Badges + expand */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Location type */}
              <span
                className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: task.locationType === "outdoor"
                    ? "rgba(16,185,129,0.12)"
                    : task.locationType === "indoor"
                    ? "rgba(59,130,246,0.12)"
                    : `rgba(${theme.accentRgb}, 0.1)`,
                  color: task.locationType === "outdoor"
                    ? "#059669"
                    : task.locationType === "indoor"
                    ? "#2563EB"
                    : theme.textSecondary,
                }}
              >
                {LOCATION_ICONS[task.locationType]}
                <span className="capitalize">{task.locationType}</span>
              </span>

              {/* Priority dot */}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: pri.bg, color: pri.text }}
              >
                {task.priority}
              </span>

              <button
                onClick={() => setExpanded(!expanded)}
                style={{ color: theme.textSecondary }}
                className="hover:opacity-80"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Description preview */}
          {task.description && !expanded && (
            <p className="text-xs mt-0.5 truncate" style={{ color: theme.textSecondary }}>
              {task.description}
            </p>
          )}

          {/* Expanded */}
          {expanded && (
            <div className="mt-3 space-y-3 animate-slide-up">
              {task.description && (
                <p className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                  {task.description}
                </p>
              )}

              {/* Status selector */}
              <div className="flex gap-1.5">
                {(["todo", "in-progress", "done"] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => patch({ status: s })}
                    className="text-[11px] px-2.5 py-1 rounded-lg capitalize transition-all"
                    style={{
                      background: task.status === s ? theme.accent : `rgba(${theme.accentRgb}, 0.1)`,
                      color: task.status === s ? "#fff" : theme.textSecondary,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Priority selector */}
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => patch({ priority: p })}
                    className="text-[11px] px-2.5 py-1 rounded-lg capitalize transition-all"
                    style={{
                      background: task.priority === p ? PRIORITY_COLORS[p].dot : PRIORITY_COLORS[p].bg,
                      color: task.priority === p ? "#fff" : PRIORITY_COLORS[p].text,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={12} />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
