import { getServiceClient } from "@/lib/db/clients/supabase";
import { saveMeasurementsAndCalculateMetrics } from "@/server/measurements";
import { NextRequest, NextResponse } from "next/server";

// Извличане на измервания
export async function GET(request: Request) {
  try {
    // Извличане на потребителско ID от параметрите на заявката
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Извличане на най-новите потребителски измервания
    const { data, error } = await supabase
      .from("user_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Запазване на измервания и изчисляване на всички метрики
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Валидация на задължителните полета
    const requiredFields = ["height", "weight", "gender", "age", "activityLevel", "neck", "waist"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Измерване на таза е задължително за жени
    if (data.gender === "female" && !data.hip) {
      return NextResponse.json({ success: false, error: "Hip measurement is required for females" }, { status: 400 });
    }

    // Извикване на съществуващата server функция
    const result = await saveMeasurementsAndCalculateMetrics(data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save measurements",
      },
      { status: 500 },
    );
  }
}
