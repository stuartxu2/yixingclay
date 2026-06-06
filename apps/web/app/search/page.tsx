import type { Metadata } from "next";
import { searchProducts } from "@/lib/search";
import { SearchResultItem } from "@/components/search/search-result-item";

type SearchParams = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({
  searchParams,
}: SearchParams): Promise<Metadata> {
  const { q } = await searchParams;
  // Clamp so an oversized ?q= can't bloat the <title> tag.
  const query = (q ?? "").trim().slice(0, 100);
  return {
    title: query ? `Search · ${query}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchParams) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <>
      <main className="mx-auto min-h-[60vh] max-w-[860px] px-6 py-16 sm:px-10">
        <section>
          <h1 className="text-[28px] font-light tracking-[-0.01em] text-ink">
            {query ? (
              <>
                Results for <span className="text-clay-deep">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>

          {!query && (
            <p className="mt-4 text-[15px] text-ink-soft">
              Enter a search term to explore the collection.
            </p>
          )}

          {query && results.length === 0 && (
            <p className="mt-4 text-[15px] text-ink-soft">
              No results for &ldquo;{query}&rdquo;. Try a different term.
            </p>
          )}

          {results.length > 0 && (
            <ul className="mt-8 flex flex-col gap-1">
              {results.map((r) => (
                <li key={r.id}>
                  <SearchResultItem result={r} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
