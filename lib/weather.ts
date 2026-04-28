import { WeatherData, WeatherCondition, ForecastDay } from "./types";

// ─── Condition mapping ─────────────────────────────────────────────────────────

function mapCondition(weatherId: number, windSpeed: number): WeatherCondition {
  if (weatherId >= 200 && weatherId < 300) return "stormy";
  if (weatherId >= 300 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "snowy";
  if (weatherId >= 700 && weatherId < 800) return "foggy";
  if (weatherId === 800) return windSpeed > 10 ? "windy" : "sunny";
  if (weatherId === 801 || weatherId === 802) return "partly-cloudy";
  if (weatherId > 802) return "cloudy";
  return "sunny";
}

function isGoodForOutdoor(condition: WeatherCondition, temp: number, windSpeed: number): boolean {
  const bad: WeatherCondition[] = ["stormy", "rainy", "snowy"];
  if (bad.includes(condition)) return false;
  if (temp < 10 || temp > 40) return false;
  if (windSpeed > 50) return false;
  return true;
}

function outdoorScore(condition: WeatherCondition, temp: number, windSpeed: number, humidity: number): number {
  let score = 100;
  if (condition === "stormy") score -= 80;
  else if (condition === "rainy") score -= 60;
  else if (condition === "snowy") score -= 50;
  else if (condition === "foggy") score -= 20;
  else if (condition === "cloudy") score -= 10;
  if (temp > 38) score -= 30;
  else if (temp > 35) score -= 15;
  else if (temp < 10) score -= 40;
  if (windSpeed > 50) score -= 30;
  else if (windSpeed > 30) score -= 15;
  if (humidity > 90) score -= 15;
  return Math.max(0, Math.min(100, score));
}

// ─── Smart daily tip ──────────────────────────────────────────────────────────

function buildTip(data: {
  condition: WeatherCondition;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
}): string {
  const { condition, temp, feels_like, humidity, wind_speed, visibility } = data;
  const heatDiff = feels_like - temp;

  if (condition === "stormy") return "⛈️ Severe weather today — stay indoors and secure outdoor items.";
  if (condition === "rainy") return "🌧️ Rainy day — carry an umbrella and reschedule outdoor tasks.";
  if (condition === "snowy") return "❄️ Snowy conditions — dress in layers and allow extra travel time.";
  if (condition === "foggy") return `🌫️ Low visibility (${visibility} km) — drive carefully and use headlights.`;
  if (temp >= 38) return `🥵 Extreme heat at ${temp}°C — stay hydrated and avoid outdoor work between 11am–3pm.`;
  if (temp >= 34 && heatDiff >= 4) return `☀️ Hot and humid — ${temp}°C feels like ${feels_like}°C. Stay hydrated!`;
  if (wind_speed >= 40) return `💨 Very windy at ${wind_speed} km/h — secure loose items and avoid tall trees.`;
  if (wind_speed >= 25) return `🌬️ Breezy at ${wind_speed} km/h — might be too windy for outdoor dining.`;
  if (humidity >= 85) return `💧 Very humid today (${humidity}%) — expect that "sticky" feeling outdoors.`;
  if (condition === "sunny" && temp >= 28 && temp < 34) return `😎 Great day! Warm sun at ${temp}°C — perfect for outdoor tasks.`;
  if (condition === "partly-cloudy") return `🌤️ Pleasant partly cloudy day — a good time for outdoor activities.`;
  if (condition === "cloudy") return `⛅ Overcast but comfortable — outdoor tasks should be fine.`;
  if (temp < 15) return `🧥 Cool at ${temp}°C — bring a jacket if heading outside.`;
  return `🌡️ ${temp}°C today, feeling like ${feels_like}°C. Plan accordingly!`;
}

// ─── API fetch ────────────────────────────────────────────────────────────────

export async function fetchWeather(city: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === "your_openweather_api_key_here") {
    return getMockWeather(city);
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return getMockWeather(city);

  const d = await res.json();
  const windKph = Math.round(d.wind.speed * 3.6);
  const visKm = Math.round((d.visibility || 10000) / 1000);
  const condition = mapCondition(d.weather[0].id, windKph);
  const good = isGoodForOutdoor(condition, Math.round(d.main.temp), windKph);

  return {
    city: d.name,
    temp: Math.round(d.main.temp),
    feels_like: Math.round(d.main.feels_like),
    temp_min: Math.round(d.main.temp_min),
    temp_max: Math.round(d.main.temp_max),
    description: d.weather[0].description,
    icon: d.weather[0].icon,
    humidity: d.main.humidity,
    wind_speed: windKph,
    visibility: visKm,
    condition,
    tip: buildTip({ condition, temp: Math.round(d.main.temp), feels_like: Math.round(d.main.feels_like), humidity: d.main.humidity, wind_speed: windKph, visibility: visKm }),
    isGoodForOutdoor: good,
  };
}

export async function fetchForecast(city: string): Promise<ForecastDay[]> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === "your_openweather_api_key_here") {
    return getMockForecast();
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=40`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return getMockForecast();

  const d = await res.json();

  // Group by date and pick the noon slot
  const byDate: Record<string, any> = {};
  for (const item of d.list) {
    const date = item.dt_txt.split(" ")[0];
    const hour = parseInt(item.dt_txt.split(" ")[1]);
    if (!byDate[date] || Math.abs(hour - 12) < Math.abs(parseInt(byDate[date].dt_txt.split(" ")[1]) - 12)) {
      byDate[date] = item;
    }
  }

  return Object.entries(byDate).slice(0, 5).map(([date, item]: [string, any]) => {
    const windKph = Math.round(item.wind.speed * 3.6);
    const condition = mapCondition(item.weather[0].id, windKph);
    const score = outdoorScore(condition, Math.round(item.main.temp), windKph, item.main.humidity);
    return {
      date,
      temp_min: Math.round(item.main.temp_min),
      temp_max: Math.round(item.main.temp_max),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      condition,
      isGoodForOutdoor: score >= 50,
      score,
    };
  });
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function getMockWeather(city: string): WeatherData {
  const condition: WeatherCondition = "partly-cloudy";
  return {
    city,
    temp: 32,
    feels_like: 37,
    temp_min: 28,
    temp_max: 34,
    description: "partly cloudy",
    icon: "02d",
    humidity: 74,
    wind_speed: 14,
    visibility: 10,
    condition,
    tip: "☀️ Hot and humid — 32°C feels like 37°C. Stay hydrated and plan outdoor tasks in the morning!",
    isGoodForOutdoor: true,
  };
}

function getMockForecast(): ForecastDay[] {
  const today = new Date();
  const conditions: WeatherCondition[] = ["sunny", "partly-cloudy", "rainy", "cloudy", "sunny"];
  const scores = [90, 75, 20, 45, 85];
  return conditions.map((condition, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: dateStr,
      temp_min: 26 + Math.floor(Math.random() * 4),
      temp_max: 32 + Math.floor(Math.random() * 4),
      description: condition.replace("-", " "),
      icon: ["01d", "02d", "10d", "04d", "01d"][i],
      condition,
      isGoodForOutdoor: scores[i] >= 50,
      score: scores[i],
    };
  });
}
