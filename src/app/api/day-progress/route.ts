import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");
    const dayExerciseIdsParam = searchParams.get("dayExerciseIds");

    if (!userId || !sessionId || !dayExerciseIdsParam) {
      return NextResponse.json({ error: "User ID, Session ID, and Daily Exercise IDs are required" }, { status: 400 });
    }

    const dayExerciseIds = dayExerciseIdsParam.split(",").map((id) => parseInt(id.trim(), 10));

    if (dayExerciseIds.some(isNaN)) {
      return NextResponse.json({ error: "Invalid exercise IDs provided" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("workout_exercise_progress")
      .select("*")
      .eq("session_id", sessionId)
      .in("day_exercise_id", dayExerciseIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
