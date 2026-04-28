import { LocationType, Priority, WeatherCondition } from "./types";

// ─── Keyword banks ─────────────────────────────────────────────────────────────

const OUTDOOR_KEYWORDS = [
  "run", "jog", "walk", "hike", "cycle", "bike", "swim", "picnic", "garden",
  "mow", "lawn", "park", "beach", "market", "grocery", "shop", "errands",
  "car wash", "bbq", "barbecue", "outdoor", "outside", "playground", "sports",
  "football", "basketball", "tennis", "golf", "fishing", "camping", "trail",
  "delivery", "commute", "drive", "fuel", "petrol", "gas", "umbrella", "roof",
];

const INDOOR_KEYWORDS = [
  "study", "read", "write", "code", "work", "call", "meeting", "zoom",
  "cook", "clean", "laundry", "dishes", "vacuum", "organize", "homework",
  "gym", "yoga", "meditate", "watch", "movie", "game", "sleep", "nap",
  "doctor", "dentist", "hospital", "clinic", "bank", "online", "email",
  "report", "presentation", "design", "draw", "paint", "craft",
];

// ─── Auto-detect location type ────────────────────────────────────────────────

export function detectLocationType(title: string, description?: string): LocationType {
  const text = `${title} ${description || ""}`.toLowerCase();
  const isOutdoor = OUTDOOR_KEYWORDS.some((kw) => text.includes(kw));
  const isIndoor = INDOOR_KEYWORDS.some((kw) => text.includes(kw));

  if (isOutdoor && !isIndoor) return "outdoor";
  if (isIndoor && !isOutdoor) return "indoor";
  if (isOutdoor && isIndoor) return "outdoor"; // outdoor wins if ambiguous
  return "either";
}

// ─── Weather-based priority bump ──────────────────────────────────────────────

// Keywords that should be bumped to HIGH during severe weather
const URGENT_IN_STORM_KEYWORDS = [
  "roof", "leak", "umbrella", "rain", "drain", "flood", "window", "shelter",
  "generator", "candle", "battery", "torch", "flashlight", "emergency",
];

export function shouldBumpPriority(
  title: string,
  description: string | undefined,
  condition: WeatherCondition
): boolean {
  if (!["stormy", "rainy"].includes(condition)) return false;
  const text = `${title} ${description || ""}`.toLowerCase();
  return URGENT_IN_STORM_KEYWORDS.some((kw) => text.includes(kw));
}

export function getWeatherBumpedPriority(
  originalPriority: Priority,
  title: string,
  description: string | undefined,
  condition: WeatherCondition
): Priority {
  if (shouldBumpPriority(title, description, condition)) return "high";
  return originalPriority;
}

// ─── Weather warning for outdoor tasks ───────────────────────────────────────

export function hasWeatherWarning(
  locationType: LocationType,
  condition: WeatherCondition
): boolean {
  const bad: WeatherCondition[] = ["stormy", "rainy", "snowy"];
  return locationType === "outdoor" && bad.includes(condition);
}

// ─── Best day suggestion from forecast ───────────────────────────────────────

export function getBestDayForOutdoor(
  forecast: { date: string; score: number; condition: WeatherCondition }[]
): { date: string; score: number } | null {
  if (!forecast.length) return null;
  const sorted = [...forecast].sort((a, b) => b.score - a.score);
  return sorted[0];
}
