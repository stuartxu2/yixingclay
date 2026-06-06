import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your PO/ET tea pet order.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <main className="mx-auto max-w-[1180px] px-6 py-12 sm:px-10 sm:py-16">
        <CheckoutFlow />
      </main>
    </>
  );
}
