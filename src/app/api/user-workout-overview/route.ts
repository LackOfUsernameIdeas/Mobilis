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
    const { data: preferences, error: prefError } = await supabase
      .from("workout_user_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (prefError) throw prefError;

    // Извличане на най-новата генерация на тренировъчен план
    const { data: generation, error: genError } = await supabase
      .from("workout_generations")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (genError) throw genError;

    // Извличане на дневните препоръки за текущата генерация
    const { data: days, error: daysError } = await supabase
      .from("workout_day_recommendations")
      .select("*")
      .eq("generation_id", generation.id)
      .order("day", { ascending: true });

    if (daysError) throw daysError;

    // Извличане на упражненията за всеки ден с JOIN към таблицата workout_exercises
    const { data: exercises, error: exError } = await supabase
      .from("workout_day_exercises")
      .select(
        `
    *,
    workout_exercises (*)
  `,
      )
      .eq("generation_id", generation.id);

    if (exError) throw exError;

    console.log(`Successfully fetched complete workout plan for user ${userId}`);

    // Връщане на комплексния обект с цялата информация
    return NextResponse.json({
      preferences,
      generation,
      day_recommendations: days,
      day_exercises: exercises,
    });
  } catch (error: any) {
    console.error("Error fetching workout plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");
//
//     if (!userId) {
//       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//     }
//
//     const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
//
//     const { data: preferences, error: prefError } = await supabase
//       .from("workout_user_preferences")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .single();
//
//     if (prefError) throw prefError;
//
//     const { data: generation, error: genError } = await supabase
//       .from("workout_generations")
//       .select("*")
//       .eq("user_id", userId)
//       .order("id", { ascending: false })
//       .limit(1)
//       .single();
//
//     if (genError) throw genError;
//
//     const { data: dayRecommendation, error: dayError } = await supabase
//       .from("workout_day_recommendations")
//       .select("*")
//       .eq("generation_id", generation.id)
//       .order("day", { ascending: true })
//       .limit(1)
//       .single();
//
//     if (dayError) throw dayError;
//
//     const { data: exercises, error: exError } = await supabase
//       .from("workout_day_exercises")
//       .select(
//         `
//         sets,
//         reps,
//         workout_exercises (
//           exercise_id,
//           category
//         )
//       `,
//       )
//       .eq("generation_id", generation.id)
//       .eq("day", dayRecommendation.day);
//
//     if (exError) throw exError;
//
//     return NextResponse.json({
//       targetWeight: preferences.targetWeightValue,
//       nextWorkout: {
//         day: dayRecommendation.day,
//         focus: dayRecommendation.focus,
//         exercises: exercises.map((e) => ({
//           name: e.workout_exercises.exercise_id,
//           sets: e.sets,
//           reps: e.reps,
//         })),
//       },
//     });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
