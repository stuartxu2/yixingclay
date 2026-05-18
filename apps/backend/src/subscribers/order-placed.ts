import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { formatMoney, renderEmail, sendEmail } from "../lib/email"

const SITE = "https://yixingclay.com"
const ADMIN_URL = process.env.MEDUSA_ADMIN_URL || "http://localhost:9000/app"

type OrderItem = { title: string; quantity: number; unit_price: number }

/** Renders the shared line-item table with a total row. */
function itemsTable(items: OrderItem[], total: number, currency: string): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;font-size:14px;color:#3a3330;">
        ${item.title} <span style="color:#8c7b72;">× ${item.quantity}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3d8;font-size:14px;color:#3a3330;text-align:right;">
        ${formatMoney(item.unit_price * item.quantity, currency)}
      </td>
    </tr>`,
    )
    .join("")
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #e8e3d8;">
    ${rows}
    <tr>
      <td style="padding:16px 0 0;font-size:14px;font-weight:500;color:#1e1915;">Total</td>
      <td style="padding:16px 0 0;font-size:14px;font-weight:500;color:#8b5c3e;text-align:right;">
        ${formatMoney(total, currency)}
      </td>
    </tr>
  </table>`
}

function addressLine(a: Record<string, string> | null | undefined): string {
  if (!a) return "—"
  return `${a.first_name ?? ""} ${a.last_name ?? ""}, ${a.address_1 ?? ""}, ${
    a.city ?? ""
  }, ${a.province ?? ""} ${a.postal_code ?? ""}, ${(
    a.country_code ?? ""
  ).toUpperCase()}`
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve(Modules.ORDER)
  const order = (await orderService.retrieveOrder(data.id, {
    relations: ["items", "shipping_address", "billing_address"],
  })) as Record<string, any>

  const displayId = order.display_id ?? data.id
  const items: OrderItem[] = order.items ?? []
  const total: number = order.total ?? 0
  const currency: string = order.currency_code ?? "usd"
  const email: string | undefined = order.email
  const shipTo = addressLine(order.shipping_address)
  const customerName = order.shipping_address
    ? `${order.shipping_address.first_name ?? ""} ${
        order.shipping_address.last_name ?? ""
      }`.trim()
    : ""

  // ── 1. Customer order confirmation ────────────────────────────────────────
  if (email) {
    const body = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:300;color:#1e1915;letter-spacing:-0.01em;">
        Order confirmed.
      </h1>
      <p style="margin:0 0 28px;font-size:14px;color:#8c7b72;">
        Order #${displayId} · thank you for choosing a piece of the studio.
      </p>
      ${itemsTable(items, total, currency)}
      <div style="margin-top:28px;padding:16px 20px;background:#f5f0e4;border-radius:8px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c7b72;">
          Shipping to
        </p>
        <p style="margin:0;font-size:13px;color:#3a3330;">${shipTo}</p>
      </div>
      <div style="margin-top:28px;padding:20px;border-left:3px solid #c47a52;">
        <p style="margin:0;font-size:13px;font-style:italic;color:#6b5c53;line-height:1.6;">
          Once your tea pet arrives, begin seasoning it: bathe it in warm leftover
          tea after each session and brush gently. The unglazed clay will slowly
          darken into a patina that is yours alone.
        </p>
      </div>
      <div style="margin-top:32px;text-align:center;">
        <a href="${SITE}/account"
          style="display:inline-block;padding:14px 32px;background:#1e1915;color:#fcfaf2;font-size:14px;font-weight:500;letter-spacing:0.04em;border-radius:100px;text-decoration:none;">
          View your order
        </a>
      </div>`
    const ok = await sendEmail({
      to: email,
      subject: `Your PO/ET order #${displayId} is confirmed`,
      html: renderEmail(`PO/ET order #${displayId}`, body),
      tag: "order-placed",
    })
    if (ok) {
      console.log(
        `[order-placed] Confirmation sent to ${email} for order #${displayId}`,
      )
    }
  } else {
    console.warn("[order-placed] Order has no email — skipping customer email")
  }

  // ── 2. New-order alert to studio staff ────────────────────────────────────
  const staffTo = process.env.ORDER_NOTIFICATION_EMAIL
  if (staffTo) {
    const body = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:300;color:#1e1915;letter-spacing:-0.01em;">
        New order #${displayId}
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#8c7b72;">
        ${customerName || "A customer"} just placed an order — time to pack a piece.
      </p>
      ${itemsTable(items, total, currency)}
      <div style="margin-top:28px;padding:16px 20px;background:#f5f0e4;border-radius:8px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c7b72;">
          Customer
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#3a3330;">
          ${customerName || "—"} · ${email ?? "no email"}
        </p>
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c7b72;">
          Ship to
        </p>
        <p style="margin:0;font-size:13px;color:#3a3330;">${shipTo}</p>
      </div>
      <div style="margin-top:32px;text-align:center;">
        <a href="${ADMIN_URL}/orders/${order.id}"
          style="display:inline-block;padding:14px 32px;background:#1e1915;color:#fcfaf2;font-size:14px;font-weight:500;letter-spacing:0.04em;border-radius:100px;text-decoration:none;">
          Open in Medusa admin
        </a>
      </div>`
    const ok = await sendEmail({
      to: staffTo,
      subject: `New order #${displayId} — ${customerName || "customer"}`,
      html: renderEmail(`New order #${displayId}`, body),
      tag: "order-placed-staff",
    })
    if (ok) {
      console.log(
        `[order-placed] Staff alert sent to ${staffTo} for order #${displayId}`,
      )
    }
  } else {
    console.warn(
      "[order-placed] ORDER_NOTIFICATION_EMAIL not set — skipping staff alert",
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
