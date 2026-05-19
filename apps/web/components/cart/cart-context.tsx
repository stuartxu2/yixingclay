"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { medusa } from "@/lib/medusa";

export interface TrayLine {
  slug: string;
  name: string;
  price: number; // cents, per unit
  quantity: number;
  /** Thumbnail path — lets the tray show pots and pets without a slug lookup. */
  image?: string;
  /** Detail-page route for this line. */
  href?: string;
}

/** What `add` accepts — a product without a quantity. */
type AddItem = Pick<TrayLine, "slug" | "name" | "price" | "image" | "href">;

interface CartValue {
  lines: TrayLine[];
  count: number;
  subtotal: number;
  toast: string | null;
  open: boolean;
  add: (item: AddItem, qty?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, qty: number) => void;
  openCart: () => void;
  closeCart: () => void;
  ensureCheckoutCart: () => Promise<string>;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "poet.tray.v1";
const CART_ID_KEY = "poet.cartId.v1";

const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID ?? "";

/**
 * Normalise persisted tray data into consolidated lines. Tolerates the older
 * format that stored one entry per unit with no `quantity` field — duplicate
 * slugs are merged and their counts summed.
 */
function normalizeLines(raw: unknown): TrayLine[] {
  if (!Array.isArray(raw)) return [];
  const bySlug = new Map<string, TrayLine>();
  for (const r of raw as Record<string, unknown>[]) {
    if (!r || typeof r.slug !== "string") continue;
    const qty =
      typeof r.quantity === "number" && r.quantity > 0 ? r.quantity : 1;
    const existing = bySlug.get(r.slug);
    if (existing) {
      existing.quantity += qty;
    } else {
      bySlug.set(r.slug, {
        slug: r.slug,
        name: String(r.name ?? ""),
        price: Number(r.price ?? 0),
        quantity: qty,
        image: typeof r.image === "string" ? r.image : undefined,
        href: typeof r.href === "string" ? r.href : undefined,
      });
    }
  }
  return [...bySlug.values()];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<TrayLine[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const cartIdRef = useRef<string | null>(null);

  // Rehydrate local lines + Medusa cart ID on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(normalizeLines(JSON.parse(raw)));
      cartIdRef.current = localStorage.getItem(CART_ID_KEY);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage may be unavailable */
    }
  }, [lines]);

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  // Add an item — same slug consolidates into one line with a higher count.
  const add = useCallback((item: AddItem, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === item.slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === item.slug ? { ...l, quantity: l.quantity + qty } : l,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setToast(`${item.name} — added to your tea tray`);
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  // Set an exact quantity; a count of zero or less removes the line.
  const setQuantity = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.slug !== slug)
        : prev.map((l) => (l.slug === slug ? { ...l, quantity: qty } : l)),
    );
  }, []);

  // Look up the first variant ID for a product slug (handle).
  const variantForSlug = useCallback(
    async (slug: string): Promise<string | undefined> => {
      const { products } = await medusa.store.product.list({
        handle: slug,
        fields: "*variants",
      } as Parameters<typeof medusa.store.product.list>[0]);
      return (products as { variants?: { id: string }[] }[])[0]?.variants?.[0]
        ?.id;
    },
    [],
  );

  /**
   * Guarantee a usable Medusa cart for checkout. The local tray is the source
   * of truth: if the stored cart ID is stale/completed or its line items no
   * longer match the tray, this builds a fresh cart that mirrors it exactly.
   */
  const ensureCheckoutCart = useCallback(async (): Promise<string> => {
    const localUnits = lines.reduce((s, l) => s + l.quantity, 0);
    const existing =
      cartIdRef.current ?? localStorage.getItem(CART_ID_KEY) ?? null;

    if (existing) {
      try {
        const { cart } = await medusa.store.cart.retrieve(existing);
        const items = (cart.items ?? []) as { quantity?: number }[];
        const itemCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
        if (!cart.completed_at && itemCount === localUnits && itemCount > 0) {
          cartIdRef.current = existing;
          return existing;
        }
      } catch {
        /* stale or deleted cart — fall through and rebuild */
      }
    }

    // Build a fresh cart and mirror the local tray into it.
    const { cart } = await medusa.store.cart.create(
      REGION_ID ? { region_id: REGION_ID } : {},
    );
    cartIdRef.current = cart.id;
    try {
      localStorage.setItem(CART_ID_KEY, cart.id);
    } catch {
      /* storage may be unavailable */
    }

    for (const line of lines) {
      const variantId = await variantForSlug(line.slug);
      if (variantId) {
        await medusa.store.cart.createLineItem(cart.id, {
          variant_id: variantId,
          quantity: line.quantity,
        });
      }
    }
    return cart.id;
  }, [lines, variantForSlug]);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      toast,
      open,
      add,
      remove,
      setQuantity,
      openCart,
      closeCart,
      ensureCheckoutCart,
    }),
    [
      lines,
      toast,
      open,
      add,
      remove,
      setQuantity,
      openCart,
      closeCart,
      ensureCheckoutCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast message={toast} />
    </CartContext.Provider>
  );
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

function Toast({ message }: { message: string | null }) {
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-7 left-1/2 z-[600] -translate-x-1/2 rounded-full bg-ink px-6 py-3.5 text-[13.5px] font-medium text-paper shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)] transition-all duration-500 ${
        message
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      {message ?? ""}
    </div>
  );
}
