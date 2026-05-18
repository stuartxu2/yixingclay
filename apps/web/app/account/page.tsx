"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/components/auth/auth-context";
import { medusa } from "@/lib/medusa";
import { formatPrice } from "@/lib/products";

interface Order {
  id: string;
  display_id: number;
  status: string;
  created_at: string;
  total: number;
  currency_code: string;
  items?: { title: string; quantity: number; unit_price: number }[];
}

export default function AccountPage() {
  const { customer, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/account/login");
    }
  }, [loading, customer, router]);

  // Fetch orders once authenticated
  useEffect(() => {
    if (!customer) return;
    medusa.store.order
      .list({ limit: 20, fields: "*items" } as Parameters<typeof medusa.store.order.list>[0])
      .then(({ orders: o }) => setOrders((o as Order[]) ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-[900px] items-center justify-center px-6 py-16">
          <p className="text-[14px] text-ink-faint">Loading…</p>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!customer) return null; // redirect in flight

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-6 py-14 sm:px-10 sm:py-20">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Account</p>
            <h1 className="text-[clamp(28px,3.5vw,44px)] font-extralight tracking-[-0.02em]">
              {customer.first_name
                ? `${customer.first_name} ${customer.last_name ?? ""}`.trim()
                : customer.email}
            </h1>
            <p className="mt-1 text-[14px] text-ink-faint">{customer.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-full border border-ink-faint/40 px-5 py-2.5 text-[13px] font-medium transition-colors hover:border-ink"
          >
            Sign out
          </button>
        </div>

        {/* Order history */}
        <section>
          <h2 className="mb-5 text-[16px] font-medium">Order History</h2>

          {ordersLoading ? (
            <p className="text-[14px] text-ink-faint">Loading orders…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-ink-faint/20 bg-cream/50 px-7 py-10 text-center">
              <p className="text-[14px] text-ink-faint">No orders yet.</p>
              <Link
                href="/tea-pets"
                className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-[13.5px] font-medium text-paper transition-opacity hover:opacity-85"
              >
                Shop tea pets
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-2xl border border-ink-faint/20 bg-cream/40 px-6 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium uppercase tracking-widest text-ink-faint">
                        Order #{order.display_id}
                      </p>
                      <p className="mt-0.5 font-mono text-[18px] font-medium tracking-wide text-ink">
                        {formatPrice(order.total)} {order.currency_code?.toUpperCase()}
                      </p>
                      <p className="mt-1 text-[12.5px] text-ink-faint">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-medium capitalize ${
                        order.status === "completed"
                          ? "bg-jade/15 text-jade"
                          : order.status === "pending"
                          ? "bg-clay/15 text-clay"
                          : "bg-ink-faint/15 text-ink-faint"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <ul className="mt-4 space-y-1 border-t border-ink-faint/15 pt-4">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-[13px] text-ink-faint">
                          <span>
                            {item.title} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.unit_price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
