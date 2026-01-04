"use server";

import { cookies } from "next/headers";

/**
 * Извлича стойност от cookie по зададен ключ
 * @param key - Ключ на cookie-то
 * @returns Стойността на cookie-то или undefined ако не съществува
 */
export async function getValueFromCookie(key: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

/**
 * Записва стойност в cookie
 * @param key - Ключ на cookie-то
 * @param value - Стойност за записване
 * @param options - Опции за cookie-то (path и maxAge)
 * @param options.path - Път за cookie-то (по подразбиране "/")
 * @param options.maxAge - Време на живот в секунди (по подразбиране 7 дни)
 */
export async function setValueToCookie(
  key: string,
  value: string,
  options: { path?: string; maxAge?: number } = {},
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(key, value, {
    path: options.path ?? "/",
    maxAge: options.maxAge ?? 60 * 60 * 24 * 7,
  });
}

/**
 * Извлича потребителска настройка от cookie с валидация
 * @param key - Ключ на настройката в cookie
 * @param allowed - Масив с разрешени стойности
 * @param fallback - Стойност по подразбиране ако cookie не съществува или стойността е невалидна
 * @returns Валидирана стойност на настройката
 */
export async function getPreference<T extends string>(key: string, allowed: readonly T[], fallback: T): Promise<T> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(key);
  const value = cookie ? cookie.value.trim() : undefined;
  // Проверка дали стойността е в списъка с разрешени стойности
  return allowed.includes(value as T) ? (value as T) : fallback;
}
