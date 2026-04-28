"use client";

import { useState } from "react";
import { WeatherTheme } from "@/lib/types";
import { CalendarDays } from "lucide-react";

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  datesWithTasks: Set<string>;
  theme: WeatherTheme;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function MiniCalendar({ selectedDate, onDateChange, datesWithTasks, theme }: Props) {
  const [view, setView] = useState(new Date(selectedDate));
  const today = new Date();
  const todayStr = toStr(today);
  const selectedStr = toStr(selectedDate);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { date: Date; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), current: true });
  while (cells.length < 42)
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), current: false });

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  return (
    <div className="rounded-3xl p-5 animate-fade-in" style={cardStyle}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} style={{ color: theme.accent }} />
          <span className="font-display font-semibold text-sm" style={{ color: theme.textPrimary }}>
            {MONTHS[month]} {year}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-colors"
            style={{ color: theme.textSecondary }}
          >
            ‹
          </button>
          <button
            onClick={() => setView(new Date(year, month + 1, 1))}
            className="w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-colors"
            style={{ color: theme.textSecondary }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold uppercase py-1"
            style={{ color: theme.textSecondary }}>
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const str = toStr(cell.date);
          const isSelected = str === selectedStr;
          const isToday = str === todayStr;
          const hasTasks = datesWithTasks.has(str);

          return (
            <button
              key={i}
              onClick={() => onDateChange(cell.date)}
              className="relative flex flex-col items-center justify-center h-9 w-full rounded-xl text-xs font-mono transition-all duration-150"
              style={{
                background: isSelected
                  ? theme.accent
                  : isToday
                  ? `rgba(${theme.accentRgb}, 0.18)`
                  : "transparent",
                color: isSelected
                  ? "#fff"
                  : !cell.current
                  ? `rgba(${theme.accentRgb}, 0.3)`
                  : theme.textPrimary,
                fontWeight: isSelected || isToday ? 600 : 400,
              }}
            >
              {cell.date.getDate()}
              {hasTasks && !isSelected && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: theme.accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Jump to today */}
      <button
        onClick={() => { onDateChange(today); setView(new Date(today)); }}
        className="mt-3 w-full text-xs font-semibold transition-colors hover:opacity-80"
        style={{ color: theme.accent }}
      >
        Jump to today ↵
      </button>
    </div>
  );
}
