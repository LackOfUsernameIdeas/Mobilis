import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Интерфейс за комбиниран запис от телесни мазнини и тегло
interface BodyFatWeightEntry {
  createdAt: string;
  bodyFat: number | null;
  weight: number | null;
}

/**
 * Обединява масиви от метрики и измервания чрез намиране на най-близките по време записи
 * @param metrics - Масив от метрики с телесни мазнини
 * @param measurements - Масив от измервания с тегло
 * @returns Обединен масив с комбинирани данни
 */
function mergeByNearestTimestamp(
  metrics: { created_at: string; bodyFat: number }[],
  measurements: { created_at: string; weight: number }[],
): BodyFatWeightEntry[] {
  const merged: BodyFatWeightEntry[] = [];

  // Сортираме и двата масива по време (възходящ ред)
  metrics.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  measurements.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let i = 0;

  // За всяка метрика намираме най-близкото измерване по време
  for (const metric of metrics) {
    const metricTime = new Date(metric.created_at).getTime();

    let closestMeasurement: { created_at: string; weight: number } | null = null;
    let minDiff = Infinity;

    // Търсим най-близкото измерване
    while (i < measurements.length) {
      const measTime = new Date(measurements[i].created_at).getTime();
      const diff = Math.abs(measTime - metricTime);

      if (diff < minDiff) {
        minDiff = diff;
        closestMeasurement = measurements[i];
        i++;
      } else {
        // Ако разликата започва да се увеличава, спираме търсенето
        break;
      }
    }

    // Добавяме комбинирания запис
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

    // Валидация на userId параметър
    if (!userId) {
      console.log("Missing userId parameter");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Създаване на Supabase клиент
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Извличане на метрики (телесни мазнини) от базата данни
    const { data: metricsData, error: metricsError } = await supabase
      .from("user_metrics")
      .select("created_at, bodyFat")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError.message);
      return NextResponse.json({ error: metricsError.message }, { status: 500 });
    }

    // Извличане на измервания (тегло) от базата данни
    const { data: measurementsData, error: measurementsError } = await supabase
      .from("user_measurements")
      .select("created_at, weight")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (measurementsError) {
      console.error("Error fetching measurements:", measurementsError.message);
      return NextResponse.json({ error: measurementsError.message }, { status: 500 });
    }

    // Интелигентно обединяване на данните по най-близко време
    const combined = mergeByNearestTimestamp(
      metricsData as { created_at: string; bodyFat: number }[],
      measurementsData as { created_at: string; weight: number }[],
    );

    console.log(`Successfully merged ${combined.length} entries for user ${userId}`);
    return NextResponse.json(combined);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
