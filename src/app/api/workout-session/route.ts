import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, generationId, startingDay = "monday" } = await request.json();

    if (!userId || !generationId) {
      return NextResponse.json({ error: "userId and generationId are required" }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Try to get existing session
    const { data: existingSession, error: fetchError } = await supabase
      .from("workout_progress_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("generation_id", generationId)
      .eq("is_active", true)
      .single();

    if (existingSession) {
      return NextResponse.json(existingSession);
    }

    // Create new session
    const { data: newSession, error: createError } = await supabase
      .from("workout_progress_sessions")
      .insert({
        user_id: userId,
        generation_id: generationId,
        current_day: startingDay,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json(newSession);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
