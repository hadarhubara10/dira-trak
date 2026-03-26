import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use x-forwarded-host for production behind load balancers
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/`);
      } else {
        return NextResponse.redirect(`${origin}/`);
      }
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${new URL(request.url).origin}/login?error=auth`);
}
