import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-5 text-[clamp(36px,5vw,64px)] font-extralight tracking-[-0.02em]">
          Lost in the{" "}
          <em className="font-normal not-italic text-clay">kiln</em>.
        </h1>
        <p className="mt-5 max-w-[36ch] text-[15px] font-light text-ink-soft">
          This page doesn&apos;t exist — perhaps it was fired too hot and
          crumbled. The collection is still whole.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/tea-pets"
            className="rounded-full bg-ink px-7 py-3.5 text-[14px] font-medium text-paper transition-opacity hover:opacity-85"
          >
            Browse the collection
          </Link>
          <Link
            href="/"
            className="rounded-full border border-ink-faint/40 px-7 py-3.5 text-[14px] font-medium transition-colors hover:border-ink-soft hover:bg-cream"
          >
            Go home
          </Link>
        </div>
      </main>
    </>
  );
}
