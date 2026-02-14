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

    const { data: preferences } = await supabase
      .from("nutrition_user_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: generation } = await supabase
      .from("nutrition_generations")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!generation) {
      return NextResponse.json(null, { status: 200 });
    }

    const { data: days } = await supabase
      .from("nutrition_day_recommendations")
      .select("*")
      .eq("generation_id", generation.id)
      .order("day", { ascending: true });

    const { data: meals } = await supabase
      .from("nutrition_day_meals")
      .select(
        `
        *,
        nutrition_meals (*)
      `,
      )
      .eq("generation_id", generation.id)
      .order("day", { ascending: true })
      .order("time", { ascending: true });

    return NextResponse.json({
      preferences: preferences ?? null,
      generation,
      day_recommendations: days ?? [],
      day_meals: meals ?? [],
    });
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
