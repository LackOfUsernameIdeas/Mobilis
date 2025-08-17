// src/app/(main)/auth/v1/signout/route.ts
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/v1/login");
}
