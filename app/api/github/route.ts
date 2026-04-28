import { NextResponse } from "next/server";
import { fetchTrendingData } from "@/lib/github";

export async function GET() {
  try {
    const data = await fetchTrendingData();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
