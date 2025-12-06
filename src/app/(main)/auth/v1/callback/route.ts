import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/default";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_BASE_URL));
    }
  }

  return NextResponse.redirect(new URL("/auth/v1/login", process.env.NEXT_PUBLIC_BASE_URL));
}
