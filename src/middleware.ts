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

  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
  }

  // Check for today's measurements if user is authenticated and not on measurements page
  if (user && pathname.startsWith("/dashboard") && pathname !== "/dashboard/measurements") {
    try {
      const result = await checkTodayMeasurements();

      // If no measurement for today, redirect to measurements page
      if (result.success && !result.hasTodayMeasurement) {
        return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
      }
    } catch (error) {
      console.error("Error checking today's measurements:", error);
      // On error, allow access but log the issue
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
