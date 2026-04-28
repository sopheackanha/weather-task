"use client";

import { WeatherData, WeatherTheme } from "@/lib/types";
import { CONDITION_EMOJI } from "@/lib/weatherTheme";
import { Wind, Droplets, Eye, Thermometer, MapPin } from "lucide-react";

interface Props {
  weather: WeatherData | null;
  theme: WeatherTheme;
  loading: boolean;
}

export default function WeatherHero({ weather, theme, loading }: Props) {
  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: `0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)`,
  };

  if (loading) {
    return (
      <div className="rounded-3xl p-6 sm:p-8 animate-pulse" style={cardStyle}>
        <div className="flex items-start justify-between">
          <div>
            <div className="h-4 rounded-full w-32 mb-3" style={{ background: `rgba(${theme.accentRgb}, 0.2)` }} />
            <div className="h-20 rounded-2xl w-40 mb-2" style={{ background: `rgba(${theme.accentRgb}, 0.15)` }} />
            <div className="h-4 rounded-full w-48" style={{ background: `rgba(${theme.accentRgb}, 0.1)` }} />
          </div>
          <div className="text-8xl opacity-20 select-none">⛅</div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const emoji = CONDITION_EMOJI[weather.condition] ?? "🌤️";
  const isGood = weather.isGoodForOutdoor;

  return (
    <div className="rounded-3xl p-6 sm:p-8 animate-fade-in" style={cardStyle}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: main weather info */}
        <div className="flex-1">
          {/* City + outdoor badge */}
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} style={{ color: theme.accent }} />
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: theme.textSecondary }}>
              {weather.city}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: isGood
                  ? `rgba(16,185,129,0.15)`
                  : `rgba(239,68,68,0.15)`,
                color: isGood ? "#059669" : "#DC2626",
              }}
            >
              {isGood ? "✓ Good for Outdoors" : "✗ Stay Indoors"}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex items-end gap-3">
            <span
              className="font-display font-bold leading-none"
              style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)", color: theme.textPrimary }}
            >
              {weather.temp}°
            </span>
            <div className="mb-3">
              <p className="text-sm font-medium capitalize" style={{ color: theme.textSecondary }}>
                {weather.description}
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                {weather.temp_min}° / {weather.temp_max}° · Feels {weather.feels_like}°
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { icon: <Droplets size={13} />, label: `${weather.humidity}% Humidity` },
              { icon: <Wind size={13} />, label: `${weather.wind_speed} km/h Wind` },
              { icon: <Eye size={13} />, label: `${weather.visibility} km Visibility` },
              { icon: <Thermometer size={13} />, label: `Feels ${weather.feels_like}°C` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span style={{ color: theme.accent }}>{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: big emoji */}
        <div
          className="text-7xl sm:text-8xl select-none self-center sm:self-start"
          style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.15))" }}
        >
          {emoji}
        </div>
      </div>

      {/* Smart Daily Tip */}
      <div
        className="mt-5 px-4 py-3 rounded-2xl text-sm font-medium"
        style={{
          background: `rgba(${theme.accentRgb}, 0.12)`,
          border: `1px solid rgba(${theme.accentRgb}, 0.2)`,
          color: theme.textPrimary,
        }}
      >
        {weather.tip}
      </div>
    </div>
  );
}
