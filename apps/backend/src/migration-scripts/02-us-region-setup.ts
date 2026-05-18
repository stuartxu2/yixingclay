import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";
import {
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Sets up the United States region for checkout:
 * - Links pp_system_default to the USD region
 * - Creates a US Warehouse stock location + fulfillment set
 * - Adds US service zone + shipping options
 */
export default async function us_region_setup({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );
  const regionModuleService = container.resolve(ModuleRegistrationName.REGION);

  // ── 1. Find the USD region ────────────────────────────────────────────────
  logger.info("Looking up USD region...");
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "name"],
  });
  const usdRegion = regions.find((r: { currency_code: string }) => r.currency_code === "usd");
  if (!usdRegion) {
    logger.info("No USD region found — creating one...");
  }
  const regionId = usdRegion?.id;
  logger.info(`USD region: ${regionId}`);

  // ── 2. Enable pp_system_default for the USD region ───────────────────────
  logger.info("Enabling system payment provider for USD region...");
  try {
    await regionModuleService.updateRegions([
      {
        id: regionId,
        payment_providers: [{ id: "pp_system_default" }],
      },
    ]);
    logger.info("✓ pp_system_default enabled for USD region");
  } catch (e) {
    logger.warn(`Could not update region payment providers: ${e.message}`);
  }

  // ── 3. Get shipping profile ───────────────────────────────────────────────
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  // ── 4. Get default sales channel ─────────────────────────────────────────
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel = salesChannels.find(
    (sc: { name: string }) => sc.name === "Default Sales Channel"
  );

  // ── 5. Create US stock location ───────────────────────────────────────────
  logger.info("Creating US Warehouse stock location...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "US Warehouse",
          address: {
            city: "Los Angeles",
            country_code: "US",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  // ── 6. Create fulfillment set with US service zone ────────────────────────
  logger.info("Creating US fulfillment set + service zone...");
  const { Modules } = await import("@medusajs/framework/utils");

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "US Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "United States",
        geo_zones: [
          { country_code: "us", type: "country" },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // ── 7. Create shipping options for the US service zone ───────────────────
  logger.info("Creating US shipping options...");
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ships in 5-8 business days.",
          code: "standard",
        },
        prices: [
          { currency_code: "usd", amount: 1200 },
          { region_id: regionId, amount: 1200 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ships in 2-3 business days.",
          code: "express",
        },
        prices: [
          { currency_code: "usd", amount: 2500 },
          { region_id: regionId, amount: 2500 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Free Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Free",
          description: "Ships in 7-14 business days.",
          code: "free",
        },
        prices: [
          { currency_code: "usd", amount: 0 },
          { region_id: regionId, amount: 0 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });
  logger.info("✓ US shipping options created");

  // ── 8. Link sales channel to US stock location ────────────────────────────
  if (defaultSalesChannel) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
    });
    logger.info("✓ Sales channel linked to US warehouse");
  }

  // ── 9. Create US tax region ───────────────────────────────────────────────
  logger.info("Creating US tax region...");
  try {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "us", provider_id: "tp_system" }],
    });
    logger.info("✓ US tax region created");
  } catch (e) {
    logger.warn(`Tax region: ${e.message}`);
  }

  logger.info("US region setup complete.");
}
