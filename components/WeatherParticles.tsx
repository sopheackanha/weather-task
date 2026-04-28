"use client";

import { WeatherCondition, WeatherTheme } from "@/lib/types";
import { useMemo } from "react";

interface Props {
  condition: WeatherCondition;
  theme: WeatherTheme;
}

export default function WeatherParticles({ condition, theme }: Props) {
  const particles = useMemo(() => {
    if (condition === "rainy" || condition === "stormy") {
      return Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${0.6 + Math.random() * 0.8}s`,
        opacity: 0.3 + Math.random() * 0.4,
        width: condition === "stormy" ? "1.5px" : "1px",
        height: `${12 + Math.random() * 16}px`,
      }));
    }
    if (condition === "snowy") {
      return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${3 + Math.random() * 4}s`,
        size: `${4 + Math.random() * 6}px`,
      }));
    }
    return [];
  }, [condition]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Rain drops */}
      {(condition === "rainy" || condition === "stormy") && particles.map((p: any) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: "-20px",
            width: p.width,
            height: p.height,
            background: `rgba(${theme.accentRgb}, ${p.opacity})`,
            animation: `rain-fall ${p.duration} linear ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Snow flakes */}
      {condition === "snowy" && particles.map((p: any) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            background: `rgba(255,255,255,0.85)`,
            animation: `snow-fall ${p.duration} ease-in ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Sun glow */}
      {condition === "sunny" && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              top: "-80px",
              right: "10%",
              width: "320px",
              height: "320px",
              background: `radial-gradient(circle, rgba(${theme.accentRgb}, 0.25) 0%, transparent 70%)`,
              animation: "sun-pulse 4s ease-in-out infinite",
            }}
          />
          {/* Sparkles */}
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${8 + i * 4}%`,
                right: `${8 + i * 5}%`,
                width: "4px",
                height: "4px",
                background: `rgba(${theme.accentRgb}, 0.7)`,
                borderRadius: "50%",
                animation: `sparkle ${1.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </>
      )}

      {/* Lightning flash for stormy */}
      {condition === "stormy" && (
        <div
          className="absolute inset-0"
          style={{
            background: `rgba(${theme.accentRgb}, 0.08)`,
            animation: "lightning 8s ease-in-out 2s infinite",
          }}
        />
      )}

      {/* Wind lines */}
      {condition === "windy" && Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${10 + i * 10}%`,
            left: "-200px",
            width: `${80 + Math.random() * 120}px`,
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(${theme.accentRgb}, 0.4), transparent)`,
            animation: `wind-move ${2 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* Fog layers */}
      {condition === "foggy" && (
        <>
          <div
            className="absolute"
            style={{
              bottom: "20%",
              left: "-10%",
              width: "120%",
              height: "180px",
              background: `linear-gradient(0deg, rgba(255,255,255,0.5) 0%, transparent 100%)`,
              animation: "fog-drift 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: "10%",
              left: "-10%",
              width: "120%",
              height: "120px",
              background: `linear-gradient(0deg, rgba(255,255,255,0.4) 0%, transparent 100%)`,
              animation: "fog-drift 12s ease-in-out 2s infinite reverse",
            }}
          />
        </>
      )}

      {/* Floating clouds for cloudy/partly-cloudy */}
      {(condition === "cloudy" || condition === "partly-cloudy") && (
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${i * 12}%`,
                right: `${i * 15}%`,
                width: `${120 + i * 60}px`,
                height: `${40 + i * 20}px`,
                background: `rgba(255,255,255,${0.12 + i * 0.04})`,
                borderRadius: "50px",
                filter: "blur(20px)",
                animation: `cloud-float ${6 + i * 2}s ease-in-out ${i}s infinite`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
