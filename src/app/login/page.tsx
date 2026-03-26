"use client";

import { createClient } from "@/lib/supabase/client";
import { getEventValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${globalThis.location?.origin ?? ""}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-app px-8">
      <div className="mb-2 text-5xl">🏠</div>
      <h1 className="mb-1 text-[28px] font-bold text-text-primary">
        DiraTrak
      </h1>
      <p className="mb-10 text-sm text-text-secondary">
        מעקב דירות להשכרה
      </p>

      <div className="w-full max-w-[320px]">
        {sent ? (
          <div className="rounded-xl bg-green-50 p-6 text-center">
            <div className="mb-2 text-3xl">✉️</div>
            <p className="text-sm font-semibold text-green-800">
              שלחנו לך קישור להתחברות!
            </p>
            <p className="mt-1 text-xs text-green-600">
              בדוק את תיבת המייל שלך ({email})
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs text-accent-blue underline"
            >
              שלח שוב
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink}>
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                אימייל
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(getEventValue(e))}
                required
                dir="ltr"
                className="rounded-[10px] border-border bg-bg-app text-end text-sm"
              />
            </div>

            {error && (
              <p className="mb-3 text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mb-3 w-full rounded-xl bg-accent-blue py-3.5 text-[15px] font-semibold text-white hover:bg-blue-700"
            >
              {loading ? "שולח..." : "✉️ שלח לי Magic Link"}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-text-muted">
          רק הדר ובת הזוג יכולים להתחבר 🔒
        </p>
      </div>
    </div>
  );
}
