import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { renderEmail, sendEmail } from "../lib/email"

type Label = { tracking_number?: string; tracking_url?: string }
type FulfillmentItem = { title?: string; quantity?: number }

/**
 * Fires when staff mark an order's fulfillment as shipped (Medusa admin →
 * "Mark as shipped"). Emails the customer that their order is on its way,
 * with any tracking numbers entered.
 */
export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  // Staff chose not to notify the customer for this shipment.
  if (data.no_notification) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  // `data.id` is the fulfillment id; traverse the order link for customer data.
  const { data: fulfillments } = await query.graph({
    entity: "fulfillment",
    filters: { id: data.id },
    fields: [
      "id",
      "labels.tracking_number",
      "labels.tracking_url",
      "items.title",
      "items.quantity",
      "order.display_id",
      "order.email",
      "order.shipping_address.first_name",
    ],
  })

  const fulfillment = fulfillments?.[0] as Record<string, any> | undefined
  const order = fulfillment?.order as Record<string, any> | undefined
  if (!order?.email) {
    console.warn(
      `[shipment-created] No order email for fulfillment ${data.id} — skipping`,
    )
    return
  }

  const displayId = order.display_id ?? ""
  const firstName = order.shipping_address?.first_name || "there"
  const labels: Label[] = fulfillment?.labels ?? []
  const items: FulfillmentItem[] = fulfillment?.items ?? []

  const itemsHtml = items
    .map(
      (i) =>
        `<li style="font-size:14px;color:#3a3330;padding:4px 0;">${
          i.title ?? "Tea pet"
        } <span style="color:#8c7b72;">× ${i.quantity ?? 1}</span></li>`,
    )
    .join("")

  const trackingRows = labels
    .map((l) => {
      const num = l.tracking_number
      if (!num) return ""
      return l.tracking_url
        ? `<a href="${l.tracking_url}" style="color:#8b5c3e;font-weight:500;text-decoration:none;">${num}</a>`
        : `<span style="font-weight:500;color:#1e1915;">${num}</span>`
    })
    .filter(Boolean)
    .join("<br />")

  const trackingBlock = trackingRows
    ? `<div style="margin-top:24px;padding:16px 20px;background:#f5f0e4;border-radius:8px;">
         <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c7b72;">
           Tracking
         </p>
         <p style="margin:0;font-size:15px;">${trackingRows}</p>
       </div>`
    : `<p style="margin:24px 0 0;font-size:13px;color:#8c7b72;">
         Tracking details will follow shortly.
       </p>`

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:300;color:#1e1915;letter-spacing:-0.01em;">
      On its way.
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#8c7b72;">
      ${firstName}, your order #${displayId} has left the studio.
    </p>
    <ul style="margin:0;padding:0 0 0 18px;">${itemsHtml}</ul>
    ${trackingBlock}
    <div style="margin-top:28px;padding:20px;border-left:3px solid #c47a52;">
      <p style="margin:0;font-size:13px;font-style:italic;color:#6b5c53;line-height:1.6;">
        Each piece is wrapped by hand. When it arrives, unwrap it slowly — then
        give it its first tea bath to begin the patina.
      </p>
    </div>`

  const ok = await sendEmail({
    to: order.email,
    subject: `Your PO/ET order #${displayId} has shipped`,
    html: renderEmail(`PO/ET order #${displayId} shipped`, body),
    tag: "shipment-created",
  })
  if (ok) {
    console.log(
      `[shipment-created] Shipping email sent to ${order.email} for order #${displayId}`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
