// ─── Task Types ───────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "done";
export type LocationType = "outdoor" | "indoor" | "either";

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  priority: Priority;
  status: Status;
  locationType: LocationType; // auto-detected from keywords
  weatherWarning?: boolean;   // true when outdoor + bad weather
  createdAt: string;
  updatedAt: string;
}

// ─── Weather Types ─────────────────────────────────────────────────────────────

export type WeatherCondition =
  | "sunny"
  | "partly-cloudy"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "snowy"
  | "foggy"
  | "windy";

export interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number; // km/h
  visibility: number; // km
  condition: WeatherCondition;
  tip: string; // smart daily tip
  isGoodForOutdoor: boolean;
}

export interface ForecastDay {
  date: string; // YYYY-MM-DD
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
  isGoodForOutdoor: boolean;
  score: number; // 0-100 outdoor suitability score
}

// ─── Weather Theme ─────────────────────────────────────────────────────────────

export interface WeatherTheme {
  condition: WeatherCondition;
  bg: string;           // CSS background
  accent: string;       // CSS color
  accentRgb: string;    // for rgba()
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  particles: string;    // particle/effect CSS class
}
