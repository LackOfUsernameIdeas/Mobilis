import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

/**
 * GET endpoint за извличане на статистика за упражненията в дадена тренировъчна сесия
 * Изчислява брой завършени, пропуснати упражнения и процент на завършване
 * @param request - Request обект съдържащ sessionId като query параметър
 * @returns JSON отговор със статистика за сесията
 */
export async function GET(request: Request) {
  try {
    // Извличане на query параметър от URL адреса
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    // Валидация на задължителния параметър
    if (!sessionId) {
      console.log("Missing required parameter: sessionId");
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Извличане на всички статуси на упражнения за дадената сесия
    const { data, error } = await supabase
      .from("workout_exercise_progress")
      .select("status")
      .eq("session_id", sessionId);

    // Обработка на грешка при заявката
    if (error) {
      console.error("Error fetching exercise statistics:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Изчисляване на статистиката
    const completed = data?.filter((e) => e.status === "completed").length || 0;
    const skipped = data?.filter((e) => e.status === "skipped").length || 0;
    const total = completed + skipped;

    console.log(`Session ${sessionId} statistics: ${completed} completed, ${skipped} skipped out of ${total} total`);

    // Връщане на статистиката с процент на завършване
    return NextResponse.json({
      completed,
      skipped,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
