import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { checkTodayMeasurements } from "./server/measurements";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const supabase = await createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;

  // Redirect to login if not authenticated and trying to access dashboard
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirect to dashboard if authenticated and on auth pages
  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
  }

  // Check if user has completed today's measurements
  if (user && pathname.startsWith("/dashboard") && pathname !== "/dashboard/measurements") {
    try {
      const result = await checkTodayMeasurements();

      // If check failed or no measurements for today, redirect to measurements page
      if (!result.success || !result.hasTodayMeasurement) {
        return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
      }
    } catch (error) {
      console.error("Error in middleware measurement check:", error);
      // Optionally redirect to measurements page on error
      return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
