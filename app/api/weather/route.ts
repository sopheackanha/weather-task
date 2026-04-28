import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || process.env.NEXT_PUBLIC_WEATHER_CITY || "Phnom Penh";
  try {
    const weather = await fetchWeather(city);
    return NextResponse.json({ weather });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
