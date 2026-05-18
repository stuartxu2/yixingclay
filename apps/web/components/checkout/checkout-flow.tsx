"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/components/cart/cart-context";
import { useAuth } from "@/components/auth/auth-context";
import { formatPrice } from "@/lib/products";
import { medusa } from "@/lib/medusa";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ContactForm {
  email: string;
  firstName: string;
  lastName: string;
}

interface AddressForm {
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phone: string;
}

interface ShippingOption {
  id: string;
  name: string;
  amount: number;
}

/* ── Step indicator ──────────────────────────────────────────────────────── */

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Contact", "Shipping", "Payment"];
  return (
    <ol className="mb-10 flex items-center gap-0">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition-colors ${
                  done
                    ? "bg-clay text-paper"
                    : active
                    ? "bg-ink text-paper"
                    : "border border-ink-faint/40 text-ink-faint"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span
                className={`text-[13px] font-medium ${
                  active ? "text-ink" : "text-ink-faint"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-4 h-px w-12 bg-ink-faint/25 sm:w-20" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Input primitive ─────────────────────────────────────────────────────── */

function Field({
  label,
  id,
  required,
  ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-soft">
        {label} {required && <span className="text-clay">*</span>}
      </label>
      <input
        id={id}
        required={required}
        {...props}
        className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-ink-faint/50 focus:border-ink focus:ring-1 focus:ring-ink/20 disabled:opacity-50"
      />
    </div>
  );
}

/* ── Order summary sidebar ───────────────────────────────────────────────── */

function OrderSummary({
  lines,
  subtotal,
  shippingAmount,
}: {
  lines: { slug: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  shippingAmount: number;
}) {
  const total = subtotal + shippingAmount;
  return (
    <aside className="rounded-2xl border border-ink-faint/20 bg-cream/50 p-7">
      <h2 className="mb-5 text-[14px] font-medium">Order Summary</h2>
      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={line.slug} className="flex items-center gap-3.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
              <Image
                src={`/products/${line.slug}/front.jpg`}
                alt={line.name}
                fill
                sizes="56px"
                className="object-cover"
              />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-semibold text-paper">
                {line.quantity}
              </span>
            </div>
            <div className="flex-1 text-[13px]">
              <p className="font-medium leading-snug">{line.name}</p>
              <p className="text-ink-faint">Yixing clay</p>
            </div>
            <span className="text-[13px] font-medium">
              {formatPrice(line.price * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2.5 border-t border-ink-faint/20 pt-5 text-[13.5px]">
        <div className="flex justify-between">
          <span className="text-ink-faint">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-faint">Shipping</span>
          <span>{shippingAmount === 0 ? "Free" : formatPrice(shippingAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-ink-faint/20 pt-3 text-[15px] font-medium">
          <span>Total</span>
          <span className="text-clay-deep">{formatPrice(total)} USD</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Step 3: Stripe card form (must live inside <Elements>) ──────────────── */

function PaymentStep({
  contact,
  address,
  clientSecret,
  cartId,
  onBack,
  onSuccess,
}: {
  contact: ContactForm;
  address: AddressForm;
  clientSecret: string;
  cartId: string;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card input not found.");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${contact.firstName} ${contact.lastName}`,
              email: contact.email,
              address: {
                line1: address.address1,
                line2: address.address2 || undefined,
                city: address.city,
                state: address.province,
                postal_code: address.postalCode,
                country: address.countryCode.toUpperCase(),
              },
            },
          },
        }
      );

      if (stripeError) throw new Error(stripeError.message ?? "Card payment failed.");
      // Medusa's Stripe provider authorises with manual capture, so a successful
      // card confirmation lands on `requires_capture`, not `succeeded`. Both are OK.
      const paid =
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "requires_capture";
      if (!paid) throw new Error("Payment did not complete.");

      const result = await medusa.store.cart.complete(cartId);
      const orderId = (result as { type: string; order?: { id: string } })?.order?.id;
      if (!orderId) throw new Error("Order could not be created.");

      try {
        localStorage.removeItem("poet.tray.v1");
        localStorage.removeItem("poet.cartId.v1");
      } catch { /* */ }

      onSuccess(orderId);
    } catch (err) {
      setError((err as Error).message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[16px] font-medium">Review &amp; pay</h2>

      <div className="rounded-xl border border-ink-faint/20 bg-cream/50 p-5 text-[13.5px]">
        <p className="font-medium">Shipping to</p>
        <p className="mt-1 text-ink-faint">
          {contact.firstName} {contact.lastName} · {contact.email}
        </p>
        <p className="text-ink-faint">
          {address.address1}
          {address.address2 ? `, ${address.address2}` : ""},{" "}
          {address.city}, {address.province} {address.postalCode}
        </p>
      </div>

      <div className="rounded-xl border border-ink-faint/20 bg-cream/50 p-5">
        <p className="mb-4 text-[13.5px] font-medium">Card details</p>
        <div className="rounded-xl border border-ink-faint/35 bg-surface px-4 py-3.5">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#2c2824",
                  fontFamily:
                    "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
                  fontSmoothing: "antialiased",
                  "::placeholder": { color: "#b5afa9" },
                },
                invalid: { color: "#b91c1c" },
              },
            }}
          />
        </div>
        <p className="mt-3 text-[12px] text-ink-faint">
          Payments are processed securely by Stripe. We never store your card details.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 rounded-full border border-ink-faint/40 px-6 py-4 text-[14px] font-medium transition-colors hover:border-ink disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading || !stripe}
          className="flex-[2] rounded-full bg-clay px-6 py-4 text-[14px] font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {loading ? "Placing order…" : "Place Order"}
        </button>
      </div>
    </div>
  );
}

/* ── Main checkout flow ──────────────────────────────────────────────────── */

export function CheckoutFlow() {
  const router = useRouter();
  const { lines, subtotal, closeCart, ensureCheckoutCart } = useCart();
  const { customer, register } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");

  const [contact, setContact] = useState<ContactForm>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [address, setAddress] = useState<AddressForm>({
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    countryCode: "us",
    phone: "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [shippingAmount, setShippingAmount] = useState(0);

  // Established in step 1 via ensureCheckoutCart(); used by steps 2 and 3.
  const [cartId, setCartId] = useState<string | null>(null);

  // Prefill contact details for a signed-in customer
  useEffect(() => {
    if (customer) {
      setContact({
        email: customer.email,
        firstName: customer.first_name ?? "",
        lastName: customer.last_name ?? "",
      });
    }
  }, [customer]);

  // Step 1 → 2: optionally register, update cart, fetch shipping options
  const handleContactSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        // Create an account first so the SDK token is attached to the cart,
        // linking the resulting order to the new customer.
        if (createAccount && !customer) {
          try {
            await register(
              contact.email,
              password,
              contact.firstName,
              contact.lastName,
            );
          } catch (err) {
            const msg = (err as Error).message ?? "";
            setError(
              /exist/i.test(msg)
                ? 'An account with this email already exists. Sign in, or uncheck "Create an account" to continue as guest.'
                : `Could not create your account: ${msg}`,
            );
            setLoading(false);
            return;
          }
        }

        // Guarantee a valid Medusa cart — rebuilds from the local tray if the
        // background sync failed or the stored cart ID went stale.
        const activeCartId = await ensureCheckoutCart();
        setCartId(activeCartId);

        await medusa.store.cart.update(activeCartId, {
          email: contact.email,
          shipping_address: {
            first_name: contact.firstName,
            last_name: contact.lastName,
            address_1: address.address1,
            address_2: address.address2 || undefined,
            city: address.city,
            province: address.province,
            postal_code: address.postalCode,
            country_code: address.countryCode,
            phone: address.phone || undefined,
          },
        });

        const { shipping_options } = await medusa.store.fulfillment.listCartOptions({
          cart_id: activeCartId,
        });

        const opts = (shipping_options as unknown as ShippingOption[]) ?? [];
        setShippingOptions(opts);
        if (opts.length > 0) {
          setSelectedShipping(opts[0].id);
          setShippingAmount(opts[0].amount ?? 0);
        }
        setStep(2);
      } catch (err) {
        setError((err as Error).message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [
      contact,
      address,
      createAccount,
      customer,
      password,
      register,
      ensureCheckoutCart,
    ]
  );

  // Step 2 → 3: add shipping method, then initiate Stripe payment session
  const handleShippingSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cartId || !selectedShipping) return;
      setLoading(true);
      setError(null);
      try {
        await medusa.store.cart.addShippingMethod(cartId, {
          option_id: selectedShipping,
        });

        // SDK expects the cart object (uses cart.id + cart.payment_collection?.id)
        const { payment_collection } =
          await medusa.store.payment.initiatePaymentSession(
            { id: cartId } as { id: string; payment_collection?: { id: string } },
            { provider_id: "pp_stripe_stripe", data: {} }
          );

        const session = (
          payment_collection as unknown as {
            payment_sessions?: { data?: { client_secret?: string } }[];
          }
        )?.payment_sessions?.[0];

        const secret = session?.data?.client_secret;
        if (!secret) throw new Error("Could not initialise payment — no client secret returned.");

        setClientSecret(secret);
        setStep(3);
      } catch (err) {
        setError((err as Error).message ?? "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [cartId, selectedShipping]
  );

  const handleOrderSuccess = useCallback(
    (orderId: string) => {
      closeCart();
      router.push(`/order/${orderId}`);
    },
    [closeCart, router]
  );

  // Empty cart state
  if (lines.length === 0 && step === 1) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
        <p className="text-[15px] text-ink-faint">Your tea tray is empty.</p>
        <a
          href="/tea-pets"
          className="rounded-full bg-ink px-7 py-3.5 text-[14px] font-medium text-paper transition-opacity hover:opacity-85"
        >
          Browse the collection
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
      {/* Left — form steps */}
      <div>
        <h1 className="mb-8 text-[clamp(28px,3.5vw,44px)] font-extralight tracking-[-0.02em]">
          Checkout
        </h1>
        <Steps current={step} />

        {error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
            {error}
          </p>
        )}

        {/* ── Step 1: Contact + Address ── */}
        {step === 1 && (
          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-medium">Contact</h2>
              {customer ? (
                <span className="text-[12.5px] text-ink-faint">
                  Signed in as {customer.email}
                </span>
              ) : (
                <a
                  href="/account/login"
                  className="text-[12.5px] font-medium text-clay underline underline-offset-2"
                >
                  Sign in
                </a>
              )}
            </div>
            <Field
              label="Email"
              id="email"
              type="email"
              required
              disabled={!!customer}
              value={contact.email}
              onChange={(e) =>
                setContact((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="you@example.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First name"
                id="firstName"
                required
                value={contact.firstName}
                onChange={(e) =>
                  setContact((p) => ({ ...p, firstName: e.target.value }))
                }
              />
              <Field
                label="Last name"
                id="lastName"
                required
                value={contact.lastName}
                onChange={(e) =>
                  setContact((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </div>

            {/* Optional account creation — guests only */}
            {!customer && (
              <div className="rounded-xl border border-ink-faint/25 bg-cream/40 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="mt-0.5 accent-clay"
                  />
                  <span className="text-[13.5px]">
                    <span className="font-medium">Create an account</span>
                    <span className="block text-ink-faint">
                      Track your orders and check out faster next time.
                    </span>
                  </span>
                </label>
                {createAccount && (
                  <div className="mt-4">
                    <Field
                      label="Password"
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                  </div>
                )}
              </div>
            )}

            <h2 className="pt-3 text-[16px] font-medium">Shipping address</h2>
            <Field
              label="Address"
              id="address1"
              required
              value={address.address1}
              onChange={(e) =>
                setAddress((p) => ({ ...p, address1: e.target.value }))
              }
              placeholder="123 Main Street"
            />
            <Field
              label="Apartment, suite, etc."
              id="address2"
              value={address.address2}
              onChange={(e) =>
                setAddress((p) => ({ ...p, address2: e.target.value }))
              }
              placeholder="Optional"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="City"
                id="city"
                required
                value={address.city}
                onChange={(e) =>
                  setAddress((p) => ({ ...p, city: e.target.value }))
                }
              />
              <Field
                label="State / Province"
                id="province"
                required
                value={address.province}
                onChange={(e) =>
                  setAddress((p) => ({ ...p, province: e.target.value }))
                }
                placeholder="CA"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Postal code"
                id="postalCode"
                required
                value={address.postalCode}
                onChange={(e) =>
                  setAddress((p) => ({ ...p, postalCode: e.target.value }))
                }
              />
              <Field
                label="Phone (optional)"
                id="phone"
                type="tel"
                value={address.phone}
                onChange={(e) =>
                  setAddress((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-ink px-6 py-4 text-[14px] font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Continue to Shipping"}
            </button>
          </form>
        )}

        {/* ── Step 2: Shipping method ── */}
        {step === 2 && (
          <form onSubmit={handleShippingSubmit} className="space-y-5">
            <h2 className="text-[16px] font-medium">Shipping method</h2>
            {shippingOptions.length === 0 ? (
              <p className="text-[14px] text-ink-faint">
                No shipping options available for your address.
              </p>
            ) : (
              <fieldset className="space-y-3">
                <legend className="sr-only">Choose a shipping method</legend>
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-5 py-4 transition-colors ${
                      selectedShipping === opt.id
                        ? "border-ink bg-cream"
                        : "border-ink-faint/35 hover:border-ink-soft"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => {
                          setSelectedShipping(opt.id);
                          setShippingAmount(opt.amount ?? 0);
                        }}
                        className="accent-clay"
                      />
                      <span className="text-[14px] font-medium">{opt.name}</span>
                    </div>
                    <span className="text-[14px] font-medium">
                      {opt.amount === 0 ? "Free" : formatPrice(opt.amount)}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-ink-faint/40 px-6 py-4 text-[14px] font-medium transition-colors hover:border-ink"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !selectedShipping}
                className="flex-[2] rounded-full bg-ink px-6 py-4 text-[14px] font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {loading ? "Initialising payment…" : "Continue to Payment"}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Stripe card payment (inside Elements provider) ── */}
        {step === 3 && clientSecret && cartId && (
          <Elements stripe={stripePromise}>
            <PaymentStep
              contact={contact}
              address={address}
              clientSecret={clientSecret}
              cartId={cartId}
              onBack={() => setStep(2)}
              onSuccess={handleOrderSuccess}
            />
          </Elements>
        )}
      </div>

      {/* Right — order summary */}
      <OrderSummary
        lines={lines}
        subtotal={subtotal}
        shippingAmount={shippingAmount}
      />
    </div>
  );
}
