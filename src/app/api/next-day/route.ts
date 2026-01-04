import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

/**
 * POST endpoint за актуализиране на текущия ден в тренировъчна сесия
 * @param request - Request обект съдържащ sessionId и nextDay в JSON body
 * @returns JSON отговор с актуализираната сесия
 */
export async function POST(request: Request) {
  try {
    // Извличане на данните от request body
    const { sessionId, nextDay } = await request.json();

    // Валидация на задължителните полета
    if (!sessionId || !nextDay) {
      console.log("Missing required fields: sessionId or nextDay");
      return NextResponse.json({ error: "sessionId and nextDay are required" }, { status: 400 });
    }

    // Инициализиране на Supabase клиент
    const supabase = getServiceClient();

    // Актуализиране на текущия ден и последната активност в сесията
    const { data, error } = await supabase
      .from("workout_progress_sessions")
      .update({
        current_day: nextDay,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    // Обработка на грешка при актуализацията
    if (error) {
      console.error("Error updating workout session:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Session ${sessionId} updated to day ${nextDay}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
