import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

/**
 * GET endpoint за извличане на завършен прогрес на упражнения за тренировка
 * @param request - Request обект съдържащ userId и sessionId като query параметри
 * @returns JSON отговор с прогреса на упражненията и свързаната информация
 */
export async function GET(request: Request) {
  try {
    // Извличане на query параметри от URL адреса
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    // Валидация на задължителните параметри
    if (!userId || !sessionId) {
      console.log("Missing required parameters: userId or sessionId");
      return NextResponse.json({ error: "User ID and Session ID are required" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Заявка за извличане на прогреса на упражненията с JOIN-нати таблици
    const { data, error } = await supabase
      .from("workout_exercise_progress")
      .select(
        `
      *,
      workout_day_exercises (
        exercise_id,
        sets,
        reps,
        day,
        workout_exercises (
          category,
          muscle_activation
        )
      )
    `,
      )
      .eq("user_id", userId)
      .eq("status", "completed"); // Филтриране само на завършени упражнения

    // Обработка на грешка при заявката
    if (error) {
      console.error("Error fetching workout progress:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Successfully fetched ${data?.length || 0} completed exercises for user ${userId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
