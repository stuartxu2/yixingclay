import Link from "next/link";

type Variant = "solid" | "ghost" | "light";

const STYLES: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-clay",
  ghost: "border border-ink text-ink hover:bg-ink hover:text-paper",
  light: "border border-paper/40 text-paper hover:bg-paper hover:text-ink",
};

/** Pill call-to-action link with a nudging arrow. */
export function Cta({
  href,
  children,
  variant = "solid",
  arrow = true,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[14px] font-medium tracking-[0.03em] transition-all duration-300 hover:-translate-y-0.5 ${STYLES[variant]}`}
    >
      {children}
      {arrow && (
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          &rarr;
        </span>
      )}
    </Link>
  );
}
