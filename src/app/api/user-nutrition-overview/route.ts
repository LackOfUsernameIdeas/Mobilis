import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: preferences, error: prefError } = await supabase
      .from("nutrition_user_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (prefError) throw prefError;

    const { data: generation, error: genError } = await supabase
      .from("nutrition_generations")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (genError) throw genError;

    const { data: days, error: daysError } = await supabase
      .from("nutrition_day_recommendations")
      .select("*")
      .eq("generation_id", generation.id)
      .order("day", { ascending: true });

    if (daysError) throw daysError;

    const { data: meals, error: mealsError } = await supabase
      .from("nutrition_day_meals")
      .select(
        `
        *,
        nutrition_meals (*)
      `,
      )
      .eq("generation_id", generation.id)
      .order("day", { ascending: true });

    if (mealsError) throw mealsError;

    return NextResponse.json({
      preferences,
      generation,
      day_recommendations: days,
      day_meals: meals,
    });
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
