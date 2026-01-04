import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

// Инициализиране на Supabase клиент със service role права
const supabase = getServiceClient();

/**
 * POST endpoint за проверка дали потребител съществува по имейл
 * @param req - Request обект съдържащ имейл адрес в JSON body
 * @returns JSON отговор с информация дали потребителят съществува и неговите данни
 */
export async function POST(req: Request) {
  // Извличане на имейл адреса от request body
  const { email } = await req.json();

  // Извикване на RPC функция в базата данни за търсене на потребител по имейл
  const { data, error } = await supabase.rpc("get_user_by_email", {
    p_email: email,
  });

  // Обработка на грешка при заявката
  if (error) {
    console.error("Error fetching user by email:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Проверка дали потребителят съществува в резултатите
  const exists = Array.isArray(data) && data.length > 0;

  console.log(`User lookup for ${email}: ${exists ? "found" : "not found"}`);

  // Връщане на резултат с флаг за съществуване и данни за потребителя (ако има такъв)
  return NextResponse.json({ exists, user: data?.[0] ?? null });
}
