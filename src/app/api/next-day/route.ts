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
    const { sessionId, nextDay, type, maxDay } = body as {
      sessionId: string;
      nextDay: string;
      type: SessionType;
      maxDay: number;
    };

    if (!sessionId || !nextDay || typeof maxDay !== "number" || !(type in SESSION_TABLES)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const nextDayNumber = parseInt(nextDay.split(" ")[1], 10);
    if (Number.isNaN(nextDayNumber)) {
      return NextResponse.json({ error: "Invalid day format" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const table = SESSION_TABLES[type];

    if (nextDayNumber > maxDay) {
      return NextResponse.json({
        status: "completed",
        sessionId,
      });
    }

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

    return NextResponse.json({
      status: "active",
      session: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
