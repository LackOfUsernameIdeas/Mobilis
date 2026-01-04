import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId || !sessionId) {
      return NextResponse.json({ error: "User ID and Session ID are required" }, { status: 400 });
    }

    const supabase = getServiceClient();

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
      .eq("status", "skipped");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
