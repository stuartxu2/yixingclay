import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Link every product to the Default Shipping Profile.
 *
 * The tea pets were seeded without a shipping profile. That went unnoticed
 * until inventory management was enabled — once items "require shipping",
 * cart completion validates that every item's shipping profile is covered by
 * a shipping method, and a product with no profile fails that check.
 *
 *   npx medusa exec ./src/scripts/link-shipping-profiles.ts
 *
 * Safe to re-run — products that already have a profile are skipped.
 */
export default async function linkShippingProfiles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const profiles = await fulfillmentService.listShippingProfiles({})
  const profileId = profiles[0]?.id
  if (!profileId) {
    throw new Error("No shipping profile exists — cannot link products.")
  }

  const products = await productService.listProducts({}, { take: 1000 })

  let linked = 0
  let skipped = 0

  for (const product of products) {
    const { data } = await query.graph({
      entity: "product",
      filters: { id: product.id },
      fields: ["id", "shipping_profile.id"],
    })
    if (data[0]?.shipping_profile?.id) {
      skipped++
      continue
    }

    await link.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.FULFILLMENT]: { shipping_profile_id: profileId },
    })
    linked++
    logger.info(`Linked shipping profile: ${product.title}`)
  }

  logger.info(
    `Shipping profiles complete — ${linked} linked, ${skipped} already had one.`,
  )
}
