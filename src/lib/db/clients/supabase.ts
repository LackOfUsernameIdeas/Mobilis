import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service role клиент (за администраторски операции)
export function getServiceClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
