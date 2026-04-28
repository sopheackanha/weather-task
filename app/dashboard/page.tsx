"use client";

import { useState, useEffect, useCallback } from "react";
import { WeatherData, ForecastDay, Task, WeatherCondition } from "@/lib/types";
import { getTheme } from "@/lib/weatherTheme";
import WeatherHero from "@/components/WeatherHero";
import ForecastBar from "@/components/ForecastBar";
import TaskList from "@/components/TaskList";
import AddTaskModal from "@/components/AddTaskModal";
import WeatherParticles from "@/components/WeatherParticles";

function toLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard() {
  const city = process.env.NEXT_PUBLIC_WEATHER_CITY || "Phnom Penh";

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const dateStr = toLocalDateString(selectedDate);
  const condition: WeatherCondition = weather?.condition ?? "partly-cloudy";
  const theme = getTheme(condition);

  // Fetch weather
  useEffect(() => {
    setLoadingWeather(true);
    Promise.all([
      fetch(`/api/weather?city=${encodeURIComponent(city)}`).then((r) => r.json()),
      fetch(`/api/weather/forecast?city=${encodeURIComponent(city)}`).then((r) => r.json()),
    ])
      .then(([wData, fData]) => {
        if (wData.weather) setWeather(wData.weather);
        if (fData.forecast) setForecast(fData.forecast);
      })
      .finally(() => setLoadingWeather(false));
  }, [city]);

  // Fetch tasks for selected date
  const fetchTasks = useCallback(async (date: string) => {
    setLoadingTasks(true);
    try {
      const r = await fetch(`/api/tasks?date=${date}`);
      const d = await r.json();
      setTasks(d.tasks || []);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchAllTasks = useCallback(async () => {
    const r = await fetch("/api/tasks");
    const d = await r.json();
    setAllTasks(d.tasks || []);
  }, []);

  useEffect(() => { fetchTasks(dateStr); }, [dateStr, fetchTasks]);
  useEffect(() => { fetchAllTasks(); }, [fetchAllTasks]);

  const handleTaskAdded = (task: Task) => {
    setTasks((p) => [...p, task]);
    setAllTasks((p) => [...p, task]);
    setIsAddOpen(false);
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    setAllTasks((p) => p.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleTaskDeleted = (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    setAllTasks((p) => p.filter((t) => t.id !== id));
  };

  const datesWithTasks = new Set(allTasks.map((t) => t.date));

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-all duration-1000"
      style={{ background: theme.bg, color: theme.textPrimary }}
    >
      {/* Atmospheric particles */}
      <WeatherParticles condition={condition} theme={theme} />

      {/* Subtle grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Weather Hero — full-width atmospheric panel */}
        <WeatherHero
          weather={weather}
          theme={theme}
          loading={loadingWeather}
        />

        {/* 5-Day Forecast + best day suggestion */}
        {!loadingWeather && forecast.length > 0 && (
          <ForecastBar forecast={forecast} theme={theme} onSelectDate={setSelectedDate} />
        )}

        {/* Task Section */}
        <div className="mt-6">
          <TaskList
            date={selectedDate}
            tasks={tasks}
            allTasks={allTasks}
            loading={loadingTasks}
            weather={weather}
            theme={theme}
            datesWithTasks={datesWithTasks}
            onDateChange={setSelectedDate}
            onAddTask={() => setIsAddOpen(true)}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <AddTaskModal
          selectedDate={selectedDate}
          forecast={forecast}
          weather={weather}
          theme={theme}
          onClose={() => setIsAddOpen(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </div>
  );
}
