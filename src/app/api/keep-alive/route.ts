import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/clients/supabase";

export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase.from("user_metrics").select("id").limit(1);

    if (error) {
      console.error("Keep-alive ping failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      rows: data?.length ?? 0,
    });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
