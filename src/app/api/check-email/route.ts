import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

const supabase = getServiceClient();

export async function POST(req: Request) {
  const { email } = await req.json();

  const { data, error } = await supabase.rpc("get_user_by_email", {
    p_email: email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const exists = Array.isArray(data) && data.length > 0;

  return NextResponse.json({ exists, user: data?.[0] ?? null });
}
