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

  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/v1/login", req.url));
  }

  if (user && (pathname === "/auth/v1/login" || pathname === "/auth/v1/register")) {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/v1/login", "/auth/v1/register"],
};
