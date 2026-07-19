import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/db/clients/supabase";

export async function GET() {
  try {
    // 1. Simulate a real user login, the same way login-form.tsx does it.
    //    This hits Supabase's Auth (GoTrue) service, which is what actually
    //    resets the "project inactivity" clock
    const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: process.env.KEEP_ALIVE_EMAIL!,
      password: process.env.KEEP_ALIVE_PASSWORD!,
    });

    if (authError) {
      console.error("Keep-alive auth ping failed:", authError);
      return NextResponse.json({ success: false, step: "auth", error: authError.message }, { status: 500 });
    }

    // Sign back out immediately so we don't leave hanging sessions behind.
    await anonClient.auth.signOut();

    // 2. Keep the original DB touch as a secondary signal / cheap health check.
    const supabase = getServiceClient();
    const { data, error } = await supabase.from("user_metrics").select("id").limit(1);

    if (error) {
      console.error("Keep-alive db ping failed:", error);
      return NextResponse.json({ success: false, step: "db", error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      authUserId: authData.user?.id ?? null,
      rows: data?.length ?? 0,
    });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
