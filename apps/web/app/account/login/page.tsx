"use client";

import type { Metadata } from "next";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/components/auth/auth-context";

// Note: metadata export from "use client" files is ignored by Next.js,
// but we keep the intent clear; the parent layout sets the title template.

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/account");
    } catch (err) {
      setError((err as Error).message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[480px] flex-col justify-center px-6 py-16 sm:px-10">
        <h1 className="mb-2 text-[clamp(28px,3.5vw,40px)] font-extralight tracking-[-0.02em]">
          Sign in
        </h1>
        <p className="mb-8 text-[14px] text-ink-faint">
          Don&apos;t have an account?{" "}
          <Link href="/account/register" className="text-ink underline underline-offset-2 hover:text-clay">
            Create one
          </Link>
        </p>

        {error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-ink-soft">
              Email <span className="text-clay">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-ink-faint/50 focus:border-ink focus:ring-1 focus:ring-ink/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-ink-soft">
              Password <span className="text-clay">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-ink-faint/50 focus:border-ink focus:ring-1 focus:ring-ink/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-ink px-6 py-4 text-[14px] font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
