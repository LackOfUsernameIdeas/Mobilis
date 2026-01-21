import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

const SESSION_TABLES = {
  workout: "workout_progress_sessions",
  meal: "nutrition_progress_sessions",
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const generationId = searchParams.get("generationId");
    const type = searchParams.get("type") as keyof typeof SESSION_TABLES;

    if (!userId || !generationId || !SESSION_TABLES[type]) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from(SESSION_TABLES[type])
      .select("current_day")
      .eq("user_id", userId)
      .eq("generation_id", Number(generationId))
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      currentDay: data?.current_day ?? "Ден 1",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
