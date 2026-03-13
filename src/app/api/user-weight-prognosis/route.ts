import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET endpoint за извличане на прогнозата за тегло на потребителя
 * Връща последната генерация + етапите
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.log("Missing required parameter: userId");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: prognosis } = await supabase
      .from("nutrition_weight_prognosis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!prognosis) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(prognosis);
  } catch (error: any) {
    console.error("Error fetching weight prognosis:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
