import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { checkTodayMeasurements } from "./server/measurements";

// Middleware функция за обработка на заявки и проверка на автентикация
export async function middleware(req: NextRequest) {
  // Създава отговор, който ще бъде модифициран при нужда
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Проверява дали са налични необходимите environment променливи за Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Създава Supabase клиент за сървърна употреба
  const supabase = await createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Взима всички cookies от заявката
        getAll() {
          return req.cookies.getAll();
        },
        // Задава cookies в отговора
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Взима текущия потребител от Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;

  // Пренасочва root "/" към landing само ако НЕ си логнат
  if (pathname === "/" && !user) {
    return NextResponse.redirect(new URL("/landing", req.url));
  }

  // Пренасочва логнати потребители от landing към dashboard (каквото и да е в dashboard)
  if (user && pathname === "/landing") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Пренасочва към login, ако потребителят НЕ е логнат и се опитва да достъпи dashboard
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Пренасочва верифицирани потребители от login/register към measurements страницата
  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
  }

  // Проверява дали има измервания за днес, ако потребителят е верифициран и не е на measurements страницата
  if (user && pathname.startsWith("/dashboard") && pathname !== "/dashboard/measurements") {
    try {
      const result = await checkTodayMeasurements();

      // Ако няма измерване за днес, пренасочва към measurements страницата
      if (result.success && !result.hasTodayMeasurement) {
        return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
      }
    } catch (error) {
      console.error("Error checking today's measurements:", error);
    }
  }

  return response;
}

// Конфигурация за кои пътища middleware-ът да се прилага
export const config = {
  matcher: ["/", "/landing", "/dashboard/:path*", "/auth/login", "/auth/register"],
};
