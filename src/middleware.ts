import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables");
    return NextResponse.redirect(new URL("/auth/v1/login", req.url));
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
    return NextResponse.redirect(new URL("/auth/v1/login", req.url));
  }

  // Redirect to dashboard if authenticated and on auth pages
  if (user && (pathname === "/auth/v1/login" || pathname === "/auth/v1/register")) {
    return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
  }

  // Check if user has completed today's measurements
  if (user && pathname.startsWith("/dashboard") && pathname !== "/dashboard/measurements") {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: measurements, error } = await supabase
        .from("user_measurements")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .limit(1);

      if (error) {
        console.error("Error checking measurements:", error);
      }

      // If no measurements for today, redirect to measurements page
      if (!measurements || measurements.length === 0) {
        return NextResponse.redirect(new URL("/dashboard/measurements", req.url));
      }
    } catch (error) {
      console.error("Error in middleware measurement check:", error);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/v1/login", "/auth/v1/register"],
};
