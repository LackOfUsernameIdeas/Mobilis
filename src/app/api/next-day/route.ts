import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { sessionId, nextDay } = await request.json();

    if (!sessionId || !nextDay) {
      return NextResponse.json({ error: "sessionId and nextDay are required" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("workout_progress_sessions")
      .update({
        current_day: nextDay,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
