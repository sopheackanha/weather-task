"use client";

import { ForecastDay, WeatherTheme } from "@/lib/types";
import { CONDITION_EMOJI } from "@/lib/weatherTheme";
import { Star } from "lucide-react";

interface Props {
  forecast: ForecastDay[];
  theme: WeatherTheme;
  onSelectDate: (date: Date) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ForecastBar({ forecast, theme, onSelectDate }: Props) {
  if (!forecast.length) return null;

  const bestScore = Math.max(...forecast.map((d) => d.score));
  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  return (
    <div className="mt-4 rounded-3xl p-4 sm:p-5 animate-fade-in" style={cardStyle}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
          5-Day Forecast
        </p>
        <p className="text-xs" style={{ color: theme.textSecondary }}>
          ⭐ = Best day for outdoor tasks
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {forecast.map((day) => {
          const d = new Date(day.date + "T12:00:00");
          const dayName = DAY_NAMES[d.getDay()];
          const isToday = day.date === new Date().toISOString().split("T")[0];
          const isBest = day.score === bestScore && day.score >= 60;
          const emoji = CONDITION_EMOJI[day.condition] ?? "🌤️";

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(new Date(day.date + "T12:00:00"))}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isBest
                  ? `rgba(${theme.accentRgb}, 0.15)`
                  : isToday
                  ? `rgba(${theme.accentRgb}, 0.08)`
                  : "transparent",
                border: isBest
                  ? `1px solid rgba(${theme.accentRgb}, 0.3)`
                  : "1px solid transparent",
              }}
              title={`Select ${day.date} — Score: ${day.score}/100`}
            >
              {/* Best badge */}
              {isBest && (
                <Star size={10} fill="currentColor" style={{ color: theme.accent }} />
              )}

              {/* Day label */}
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: theme.textSecondary }}
              >
                {isToday ? "Today" : dayName}
              </span>

              {/* Emoji */}
              <span className="text-2xl">{emoji}</span>

              {/* Temp range */}
              <div className="text-center">
                <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                  {day.temp_max}°
                </p>
                <p className="text-[10px]" style={{ color: theme.textSecondary }}>
                  {day.temp_min}°
                </p>
              </div>

              {/* Outdoor score bar */}
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: `rgba(${theme.accentRgb}, 0.15)` }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${day.score}%`,
                    background: day.score >= 70
                      ? "#10B981"
                      : day.score >= 40
                      ? "#F59E0B"
                      : "#EF4444",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
