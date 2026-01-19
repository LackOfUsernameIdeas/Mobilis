import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

const SESSION_TABLES = {
  workout: "workout_progress_sessions",
  meal: "nutrition_progress_sessions",
} as const;

type SessionType = keyof typeof SESSION_TABLES;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, nextDay, type } = body as {
      sessionId: string;
      nextDay: string;
      type: SessionType;
    };

    if (!sessionId || !nextDay || !(type in SESSION_TABLES)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const table = SESSION_TABLES[type];

    const { data, error } = await supabase
      .from(table)
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
