import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

const TABLES = {
  workout: "workout_progress_sessions",
  meal: "nutrition_progress_sessions",
} as const;

type SessionType = keyof typeof TABLES;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      generationId,
      startingDay = "monday",
      type,
    } = body as {
      userId: string;
      generationId: number;
      startingDay?: string;
      type: SessionType;
    };

    if (!userId || !generationId || !type || !TABLES[type]) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const table = TABLES[type];

    const { data: existingSession } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .eq("generation_id", generationId)
      .eq("is_active", true)
      .single();

    if (existingSession) {
      return NextResponse.json(existingSession);
    }

    const { data: newSession, error } = await supabase
      .from(table)
      .insert({
        user_id: userId,
        generation_id: generationId,
        current_day: startingDay,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newSession);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
