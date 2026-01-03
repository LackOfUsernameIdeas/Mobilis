import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface BodyFatWeightEntry {
  createdAt: string;
  bodyFat: number | null;
  weight: number | null;
}

function mergeByNearestTimestamp(
  metrics: { created_at: string; bodyFat: number }[],
  measurements: { created_at: string; weight: number }[],
): BodyFatWeightEntry[] {
  const merged: BodyFatWeightEntry[] = [];

  metrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  measurements.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let i = 0;

  for (const metric of metrics) {
    const metricTime = new Date(metric.created_at).getTime();

    let closestMeasurement: { created_at: string; weight: number } | null = null;
    let minDiff = Infinity;

    while (i < measurements.length) {
      const measTime = new Date(measurements[i].created_at).getTime();
      const diff = Math.abs(measTime - metricTime);

      if (diff < minDiff) {
        minDiff = diff;
        closestMeasurement = measurements[i];
        i++;
      } else {
        break;
      }
    }

    merged.push({
      createdAt: metric.created_at,
      bodyFat: metric.bodyFat,
      weight: closestMeasurement?.weight ?? null,
    });
  }

  return merged;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: metricsData, error: metricsError } = await supabase
      .from("user_metrics")
      .select("created_at, bodyFat")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (metricsError) {
      return NextResponse.json({ error: metricsError.message }, { status: 500 });
    }

    const { data: measurementsData, error: measurementsError } = await supabase
      .from("user_measurements")
      .select("created_at, weight")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (measurementsError) {
      return NextResponse.json({ error: measurementsError.message }, { status: 500 });
    }

    // Smart merge
    const combined = mergeByNearestTimestamp(
      metricsData as { created_at: string; bodyFat: number }[],
      measurementsData as { created_at: string; weight: number }[],
    );

    return NextResponse.json(combined);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
