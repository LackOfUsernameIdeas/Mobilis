import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { sessionId, userId, dayExerciseId, status } = await request.json();

    if (!sessionId || !userId || !dayExerciseId || !status) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (status !== "completed" && status !== "skipped") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = getServiceClient();

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
          onConflict: "session_id,day_exercise_id",
        },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update session last activity
    await supabase
      .from("workout_progress_sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
