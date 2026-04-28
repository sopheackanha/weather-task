import { NextRequest, NextResponse } from "next/server";
import { fetchForecast } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || process.env.NEXT_PUBLIC_WEATHER_CITY || "Phnom Penh";
  try {
    const forecast = await fetchForecast(city);
    return NextResponse.json({ forecast });
  } catch {
    return NextResponse.json({ error: "Failed to fetch forecast" }, { status: 500 });
  }
}
