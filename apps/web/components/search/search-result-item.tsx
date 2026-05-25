import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { SearchResult } from "@/lib/search";

/** One search hit: thumbnail, title, price. Links to the resolved route. */
export function SearchResultItem({
  result,
  onNavigate,
}: {
  result: SearchResult;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={result.href}
      onClick={onNavigate}
      className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-cream"
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
        {result.thumbnail && (
          <Image
            src={result.thumbnail}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="truncate text-[15px] font-medium text-ink">
          {result.title}
        </span>
        <span className="whitespace-nowrap text-[14px] text-clay-deep">
          {formatPrice(result.price)}
        </span>
      </span>
    </Link>
  );
}
