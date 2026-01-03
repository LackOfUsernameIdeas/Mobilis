import { getServerClient } from "@/lib/db/clients/server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  return redirect("/auth/login");
}
