"use client";

import { useState, useEffect } from "react";
import { Task, WeatherData, ForecastDay, WeatherTheme, Priority } from "@/lib/types";
import { CONDITION_EMOJI } from "@/lib/weatherTheme";
import { getBestDayForOutdoor } from "@/lib/taskIntelligence";
import { X, Star, AlertTriangle, TreePine } from "lucide-react";

interface Props {
  selectedDate: Date;
  forecast: ForecastDay[];
  weather: WeatherData | null;
  theme: WeatherTheme;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
}

function toStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const OUTDOOR_HINT_WORDS = [
  "run","jog","walk","hike","cycle","bike","swim","garden","park","beach",
  "market","grocery","shop","errand","bbq","sports","outdoor"
];

export default function AddTaskModal({ selectedDate, forecast, weather, theme, onClose, onTaskAdded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toStr(selectedDate));
  const [priority, setPriority] = useState<Priority>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Detect if title looks outdoor
  const titleLower = title.toLowerCase();
  const looksOutdoor = OUTDOOR_HINT_WORDS.some((kw) => titleLower.includes(kw));
  const selectedDayForecast = forecast.find((f) => f.date === date);
  const badWeatherOnDate = selectedDayForecast && !selectedDayForecast.isGoodForOutdoor;
  const bestDay = getBestDayForOutdoor(forecast);

  const showOutdoorWarning = looksOutdoor && badWeatherOnDate;
  const showBestDaySuggestion = looksOutdoor && bestDay && bestDay.date !== date && bestDay.score >= 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          priority,
          weatherCondition: weather?.condition,
        }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      onTaskAdded(d.task);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const overlayBg = `rgba(0,0,0,${theme.condition === "stormy" || theme.condition === "rainy" ? 0.55 : 0.35})`;
  const modalStyle = {
    background: theme.cardBg.replace("0.08", "0.85").replace("0.06", "0.85").replace("0.72", "0.92").replace("0.76","0.92").replace("0.70","0.92").replace("0.80","0.95"),
    border: `1px solid ${theme.border}`,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
  };
  const inputStyle = {
    background: `rgba(${theme.accentRgb}, 0.07)`,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: overlayBg }} onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl p-6 animate-scale-in" style={modalStyle}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold" style={{ color: theme.textPrimary }}>
            New Task
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: `rgba(${theme.accentRgb}, 0.1)`, color: theme.textSecondary }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: theme.textSecondary }}>
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              autoFocus
              className="add-task-title-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
              style={inputStyle}
            />
            <style jsx>{`
              .add-task-title-input::placeholder {
                color: ${theme.textSecondary};
              }
            `}</style>

            {/* Outdoor detection hint */}
            {looksOutdoor && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <TreePine size={11} className="text-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-medium">Detected as outdoor task</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: theme.textSecondary }}>
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors resize-none"
              style={inputStyle}
            />
          </div>

          {/* Date + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: theme.textSecondary }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: theme.textSecondary }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Forecast for selected date */}
          {selectedDayForecast && (
            <div
              className="px-3 py-2.5 rounded-xl text-xs flex items-center gap-2"
              style={{
                background: `rgba(${theme.accentRgb}, 0.08)`,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
              }}
            >
              <span className="text-lg">{CONDITION_EMOJI[selectedDayForecast.condition]}</span>
              <span>
                <strong style={{ color: theme.textPrimary }}>{selectedDayForecast.date}</strong>{" "}
                — {selectedDayForecast.temp_min}°–{selectedDayForecast.temp_max}°,{" "}
                {selectedDayForecast.description} · Outdoor score:{" "}
                <span style={{ color: selectedDayForecast.score >= 60 ? "#10B981" : "#EF4444" }}>
                  {selectedDayForecast.score}/100
                </span>
              </span>
            </div>
          )}

          {/* Outdoor warning */}
          {showOutdoorWarning && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">
                ⚠️ Bad weather on this date for outdoor tasks.{" "}
                {showBestDaySuggestion && (
                  <button
                    type="button"
                    onClick={() => setDate(bestDay!.date)}
                    className="underline font-bold"
                  >
                    Switch to {bestDay!.date} (best day ⭐)
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Best day suggestion (no warning) */}
          {showBestDaySuggestion && !showOutdoorWarning && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <Star size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">
                Best day for outdoor: {bestDay!.date} (score {bestDay!.score}/100){" "}
                <button
                  type="button"
                  onClick={() => setDate(bestDay!.date)}
                  className="underline font-bold"
                >
                  Use this date
                </button>
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: `rgba(${theme.accentRgb}, 0.08)`, color: theme.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: theme.accent }}
            >
              {loading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
