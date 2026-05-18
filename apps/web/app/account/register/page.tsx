"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/components/auth/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(form.email, form.password, form.firstName, form.lastName);
      router.push("/account");
    } catch (err) {
      setError((err as Error).message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[480px] flex-col justify-center px-6 py-16 sm:px-10">
        <h1 className="mb-2 text-[clamp(28px,3.5vw,40px)] font-extralight tracking-[-0.02em]">
          Create account
        </h1>
        <p className="mb-8 text-[14px] text-ink-faint">
          Already have an account?{" "}
          <Link href="/account/login" className="text-ink underline underline-offset-2 hover:text-clay">
            Sign in
          </Link>
        </p>

        {error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className="text-[13px] font-medium text-ink-soft">
                First name <span className="text-clay">*</span>
              </label>
              <input
                id="firstName"
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={set("firstName")}
                className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className="text-[13px] font-medium text-ink-soft">
                Last name <span className="text-clay">*</span>
              </label>
              <input
                id="lastName"
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={set("lastName")}
                className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-ink-soft">
              Email <span className="text-clay">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
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
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 8 characters"
              className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-ink-faint/50 focus:border-ink focus:ring-1 focus:ring-ink/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="text-[13px] font-medium text-ink-soft">
              Confirm password <span className="text-clay">*</span>
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
              className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-ink px-6 py-4 text-[14px] font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
