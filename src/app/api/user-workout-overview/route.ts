import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET endpoint за извличане на пълна информация за тренировъчен план на потребител
 * Включва предпочитания, генерация, дневни препоръки и упражнения
 * @param request - Request обект съдържащ userId като query параметър
 * @returns JSON отговор с цялата информация за тренировъчния план
 */
export async function GET(request: Request) {
  try {
    // Извличане на query параметър от URL адреса
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Валидация на задължителния параметър
    if (!userId) {
      console.log("Missing required parameter: userId");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент със service role права
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Извличане на най-новите потребителски предпочитания за тренировки
    const { data: preferences } = await supabase
      .from("workout_user_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Извличане на най-новата генерация на тренировъчен план
    const { data: generation } = await supabase
      .from("workout_generations")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!generation) {
      return NextResponse.json(null, { status: 200 });
    }

    // Извличане на дневните препоръки за текущата генерация
    const { data: days } = await supabase
      .from("workout_day_recommendations")
      .select("*")
      .eq("generation_id", generation.id)
      .order("day", { ascending: true });

    const { data: exercises } = await supabase
      .from("workout_day_exercises")
      .select(
        `
        *,
        workout_exercises (*)
      `,
      )
      .eq("generation_id", generation.id);

    return NextResponse.json({
      preferences: preferences ?? null,
      generation,
      day_recommendations: days ?? [],
      day_exercises: exercises ?? [],
    });
  } catch (error: any) {
    console.error("Error fetching workout plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
