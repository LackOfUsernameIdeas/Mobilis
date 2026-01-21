import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

const PROGRESS_CONFIG = {
  workout: {
    table: "workout_exercise_progress",
    idColumn: "day_exercise_id",
    sessionTable: "workout_progress_sessions",
  },
  meal: {
    table: "nutrition_item_progress",
    idColumn: "day_meal_id",
    sessionTable: "nutrition_progress_sessions",
  },
} as const;

type ProgressType = keyof typeof PROGRESS_CONFIG;
type ProgressStatus = "completed" | "skipped";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, userId, dayItemId, status, type } = body as {
      sessionId: string;
      userId: string;
      dayItemId: number;
      status: ProgressStatus;
      type: ProgressType;
    };

    if (!sessionId || !userId || !dayItemId || !status || !(type in PROGRESS_CONFIG)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (status !== "completed" && status !== "skipped") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { table, idColumn, sessionTable } = PROGRESS_CONFIG[type];

    const { data, error } = await supabase
      .from(table)
      .upsert(
        {
          session_id: sessionId,
          user_id: userId,
          [idColumn]: dayItemId,
          status,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "session_id," + idColumn,
        },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from(sessionTable).update({ last_activity_at: new Date().toISOString() }).eq("id", sessionId);

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
