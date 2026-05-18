import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * One-time setup: give every product variant managed inventory with a stock
 * of 1 — each PO/ET tea pet is a one-of-a-kind piece, so once it sells it is
 * gone. Run with:
 *
 *   npx medusa exec ./src/scripts/setup-inventory.ts
 *
 * Safe to re-run — variants that already manage inventory are skipped.
 */
const US_WAREHOUSE = "sloc_01KRT0S3Q2GHQDE7Z79FE4V6QX"
const STOCK_PER_PIECE = 1

export default async function setupInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  const products = await productService.listProducts(
    {},
    { relations: ["variants"], take: 1000 },
  )

  let stocked = 0
  let skipped = 0

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (variant.manage_inventory) {
        skipped++
        continue
      }

      // 1. An inventory item to track this variant's stock
      const [item] = await inventoryService.createInventoryItems([
        {
          sku: variant.sku || variant.id,
          title: product.title,
          requires_shipping: true,
        },
      ])

      // 2. Link the variant to its inventory item
      await link.create({
        [Modules.PRODUCT]: { variant_id: variant.id },
        [Modules.INVENTORY]: { inventory_item_id: item.id },
        data: { required_quantity: 1 },
      })

      // 3. Stock the single piece at the US warehouse
      await inventoryService.createInventoryLevels([
        {
          inventory_item_id: item.id,
          location_id: US_WAREHOUSE,
          stocked_quantity: STOCK_PER_PIECE,
        },
      ])

      // 4. Turn on inventory management so 0 stock blocks the sale
      await productService.updateProductVariants(variant.id, {
        manage_inventory: true,
      })

      stocked++
      logger.info(`Stocked: ${product.title}`)
    }
  }

  logger.info(
    `Inventory setup complete — ${stocked} piece(s) stocked, ${skipped} already managed.`,
  )
}
