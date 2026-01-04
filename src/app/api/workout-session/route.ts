import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

/**
 * POST endpoint за създаване или извличане на активна тренировъчна сесия
 * Ако съществува активна сесия, я връща; иначе създава нова
 * @param request - Request обект съдържащ userId, generationId и опционално startingDay в JSON body
 * @returns JSON отговор със сесията (съществуваща или новосъздадена)
 */
export async function POST(request: Request) {
  try {
    // Извличане на данните от request body
    const { userId, generationId, startingDay = "monday" } = await request.json();

    // Валидация на задължителните полета
    if (!userId || !generationId) {
      console.log("Missing required fields: userId or generationId");
      return NextResponse.json({ error: "userId and generationId are required" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Опит за извличане на съществуваща активна сесия
    const { data: existingSession, error: fetchError } = await supabase
      .from("workout_progress_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("generation_id", generationId)
      .eq("is_active", true)
      .single();

    // Ако има съществуваща активна сесия, връщаме я
    if (existingSession) {
      console.log(`Found existing active session ${existingSession.id} for user ${userId}`);
      return NextResponse.json(existingSession);
    }

    // Създаване на нова сесия ако не съществува активна
    const { data: newSession, error: createError } = await supabase
      .from("workout_progress_sessions")
      .insert({
        user_id: userId,
        generation_id: generationId,
        current_day: startingDay,
        is_active: true,
      })
      .select()
      .single();

    // Обработка на грешка при създаването
    if (createError) {
      console.error("Error creating workout session:", createError.message);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log(`Created new workout session ${newSession.id} for user ${userId} starting on ${startingDay}`);
    return NextResponse.json(newSession);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
