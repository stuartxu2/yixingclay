"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { medusa } from "@/lib/medusa";
import { identifyUser, resetUser } from "@/lib/analytics";

interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface AuthValue {
  customer: Customer | null;
  loading: boolean;
  /**
   * The price a product is offered to the signed-in customer. For a member
   * of a wholesale customer group this is the trade price; otherwise it is
   * the retail price passed in.
   */
  priceFor: (slug: string, retailPrice: number) => number;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  // Per-customer calculated prices keyed by product slug. Empty for guests;
  // for a wholesale-group member these reflect the trade price list.
  const [prices, setPrices] = useState<Map<string, number>>(new Map());

  // On mount, restore the session only if the SDK has a stored JWT. Calling
  // customer.retrieve() without a token always 401s — skip it for guests.
  useEffect(() => {
    const hasToken =
      typeof window !== "undefined" &&
      !!window.localStorage.getItem("medusa_auth_token");
    if (!hasToken) {
      setLoading(false);
      return;
    }
    medusa.store.customer
      .retrieve()
      .then(({ customer: c }) => {
        setCustomer(c as Customer);
        identifyUser((c as Customer).id, { email: (c as Customer).email });
      })
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, []);

  // When the signed-in customer changes, reload their calculated prices.
  // The request carries the customer's token, so Medusa applies any price
  // list scoped to a customer group they belong to.
  useEffect(() => {
    if (!customer) {
      setPrices(new Map());
      return;
    }
    let cancelled = false;
    medusa.store.product
      .list({
        fields: "handle,*variants.calculated_price",
        region_id: REGION_ID,
        limit: 100,
      } as Parameters<typeof medusa.store.product.list>[0])
      .then(({ products }) => {
        if (cancelled) return;
        const next = new Map<string, number>();
        for (const p of products as {
          handle: string;
          variants?: { calculated_price?: { calculated_amount?: number } }[];
        }[]) {
          const amount = p.variants?.[0]?.calculated_price?.calculated_amount;
          if (typeof amount === "number") next.set(p.handle, amount);
        }
        setPrices(next);
      })
      .catch(() => {
        /* keep retail prices if the lookup fails */
      });
    return () => {
      cancelled = true;
    };
  }, [customer]);

  const priceFor = useCallback(
    (slug: string, retailPrice: number) => prices.get(slug) ?? retailPrice,
    [prices],
  );

  const login = useCallback(async (email: string, password: string) => {
    await medusa.auth.login("customer", "emailpass", { email, password });
    const { customer: c } = await medusa.store.customer.retrieve();
    setCustomer(c as Customer);
    identifyUser((c as Customer).id, { email: (c as Customer).email });
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => {
      const token = await medusa.auth.register("customer", "emailpass", {
        email,
        password,
      });
      const { customer: c } = await medusa.store.customer.create(
        { email, first_name: firstName, last_name: lastName },
        {},
        { Authorization: `Bearer ${token}` }
      );
      // The registration token carries no customer actor — it can only create
      // the customer. Log in again so the SDK stores a customer-scoped token,
      // required for /store/orders, the account page, and linking the cart.
      await medusa.auth.login("customer", "emailpass", { email, password });
      setCustomer(c as Customer);
      identifyUser((c as Customer).id, { email: (c as Customer).email });
    },
    []
  );

  const logout = useCallback(async () => {
    await medusa.auth.logout();
    setCustomer(null);
    resetUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ customer, loading, priceFor, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
