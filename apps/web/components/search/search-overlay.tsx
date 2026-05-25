"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchProducts, type SearchResult } from "@/lib/search";
import { SearchResultItem } from "./search-result-item";

const DEBOUNCE_MS = 250;

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input and lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Debounced search; ignore stale responses that no longer match the input.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      // Only show the spinner once the debounce window has actually elapsed,
      // so a fast typist doesn't flash "Searching…" on every keystroke.
      setLoading(true);
      const hits = await searchProducts(q);
      if (!active) return;
      setResults(hits);
      setSearched(true);
      setLoading(false);
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSearched(false);
    setLoading(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "Enter") {
      const q = query.trim();
      if (q) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
        close();
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-ink-faint/40 px-4 py-2 text-[13.5px] font-medium transition-colors hover:border-ink-soft hover:bg-cream"
        aria-label="Search"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/40 backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="mt-[12vh] w-full max-w-[640px] overflow-hidden rounded-2xl border border-ink-faint/25 bg-paper shadow-[0_40px_80px_-40px_rgba(28,28,28,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-ink-faint/20 px-5 py-4">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                aria-label="Search the collection"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search tea pets and teapots…"
                className="flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="text-[13px] text-ink-faint hover:text-ink"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-6 text-center text-[14px] text-ink-faint">
                  Searching…
                </p>
              )}
              {!loading && searched && results.length === 0 && (
                <p className="px-3 py-6 text-center text-[14px] text-ink-faint">
                  No results.
                </p>
              )}
              {!loading && !searched && (
                <p className="px-3 py-6 text-center text-[14px] text-ink-faint">
                  Start typing to search the collection.
                </p>
              )}
              {!loading &&
                results.map((r) => (
                  <SearchResultItem key={r.id} result={r} onNavigate={close} />
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m20 20-3.2-3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
