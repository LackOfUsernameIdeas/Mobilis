import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("workout_exercise_progress")
      .select("status")
      .eq("session_id", sessionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completed = data?.filter((e) => e.status === "completed").length || 0;
    const skipped = data?.filter((e) => e.status === "skipped").length || 0;
    const total = completed + skipped;

    return NextResponse.json({
      completed,
      skipped,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
