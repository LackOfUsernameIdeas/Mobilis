import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

/**
 * GET endpoint за извличане на прогрес на конкретни упражнения за дадена тренировъчна сесия
 * @param request - Request обект съдържащ userId, sessionId и dayExerciseIds като query параметри
 * @returns JSON отговор с прогреса на посочените упражнения
 */
export async function GET(request: Request) {
  try {
    // Извличане на query параметри от URL адреса
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");
    const dayExerciseIdsParam = searchParams.get("dayExerciseIds");

    // Валидация на задължителните параметри
    if (!userId || !sessionId || !dayExerciseIdsParam) {
      console.log("Missing required parameters");
      return NextResponse.json({ error: "User ID, Session ID, and Daily Exercise IDs are required" }, { status: 400 });
    }

    // Парсване на списъка с ID-та на упражненията от comma-separated стринг
    const dayExerciseIds = dayExerciseIdsParam.split(",").map((id) => parseInt(id.trim(), 10));

    // Валидация дали всички ID-та са валидни числа
    if (dayExerciseIds.some(isNaN)) {
      console.log("Invalid exercise IDs format");
      return NextResponse.json({ error: "Invalid exercise IDs provided" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Заявка за извличане на прогреса на упражненията за конкретната сесия
    const { data, error } = await supabase
      .from("workout_exercise_progress")
      .select("*")
      .eq("session_id", sessionId)
      .in("day_exercise_id", dayExerciseIds); // Филтриране по списък с ID-та

    // Обработка на грешка при заявката
    if (error) {
      console.error("Error fetching exercise progress:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Successfully fetched progress for ${data?.length || 0} exercises in session ${sessionId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
