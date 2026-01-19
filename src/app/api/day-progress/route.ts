import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

const PROGRESS_TABLES = {
  workout: {
    table: "workout_exercise_progress",
    column: "day_exercise_id",
  },
  meal: {
    table: "nutrition_item_progress",
    column: "day_meal_id",
  },
} as const;

/**
 * GET endpoint за извличане на прогрес на конкретни упражнения за дадена тренировъчна сесия
 * @param request - Request обект съдържащ userId, sessionId и dayExerciseIds като query параметри
 * @returns JSON отговор с прогреса на посочените упражнения
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");
    const idsParam = searchParams.get("itemIds");
    const type = searchParams.get("type") as keyof typeof PROGRESS_TABLES;

    if (!userId || !sessionId || !idsParam || !PROGRESS_TABLES[type]) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const ids = idsParam.split(",").map(Number);
    if (ids.some(isNaN)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { table, column } = PROGRESS_TABLES[type];

    const { data, error } = await supabase.from(table).select("*").eq("session_id", sessionId).in(column, ids);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
