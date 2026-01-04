import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

/**
 * POST endpoint за записване или актуализиране на прогреса на упражнение в тренировъчна сесия
 * @param request - Request обект съдържащ sessionId, userId, dayExerciseId и status в JSON body
 * @returns JSON отговор с актуализирания запис на прогреса
 */
export async function POST(request: Request) {
  try {
    // Извличане на данните от request body
    const { sessionId, userId, dayExerciseId, status } = await request.json();

    // Валидация на задължителните полета
    if (!sessionId || !userId || !dayExerciseId || !status) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Валидация на статуса - трябва да е "completed" или "skipped"
    if (status !== "completed" && status !== "skipped") {
      console.log("Invalid status value:", status);
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Upsert операция - добавя нов запис или актуализира съществуващ
    const { data, error } = await supabase
      .from("workout_exercise_progress")
      .upsert(
        {
          session_id: sessionId,
          user_id: userId,
          day_exercise_id: dayExerciseId,
          status: status,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "session_id,day_exercise_id", // Уникален constraint за избягване на дубликати
        },
      )
      .select()
      .single();

    // Обработка на грешка при записване
    if (error) {
      console.error("Error upserting exercise progress:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Актуализиране на последната активност в сесията
    await supabase
      .from("workout_progress_sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", sessionId);

    console.log(`Exercise progress updated: session ${sessionId}, exercise ${dayExerciseId}, status: ${status}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
