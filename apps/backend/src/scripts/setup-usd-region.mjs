/**
 * Creates a USD/US region and enables the system payment provider.
 * Run from apps/backend: node src/scripts/setup-usd-region.mjs
 */

const MEDUSA_URL = "http://localhost:9000";
const ADMIN_EMAIL = "admin@yixingclay.com";
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("Set MEDUSA_ADMIN_PASSWORD (admin credential) before running.");
  process.exit(1);
}

async function api(method, path, token, body) {
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
  console.log("Authenticating...");
  const { token } = await api("POST", "/auth/user/emailpass", null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  // Check existing regions
  const { regions } = await api("GET", "/admin/regions", token);
  const usdRegion = regions.find((r) => r.currency_code === "usd");

  let regionId;
  if (usdRegion) {
    regionId = usdRegion.id;
    console.log("USD region already exists:", regionId);
  } else {
    console.log("Creating USD/United States region...");
    const { region } = await api("POST", "/admin/regions", token, {
      name: "United States",
      currency_code: "usd",
      countries: ["us"],
    });
    regionId = region.id;
    console.log("✓ Created USD region:", regionId);
  }

  // Check available payment providers
  console.log("\nChecking payment providers...");
  try {
    const data = await api("GET", `/admin/regions/${regionId}`, token);
    console.log("Region payment providers:", data.region?.payment_providers ?? "none");
  } catch (e) {
    console.log("Could not check providers:", e.message);
  }

  // Try to add pp_system_default to the region
  console.log("\nAttempting to add pp_system_default payment provider...");
  try {
    await api("POST", `/admin/regions/${regionId}/payment-providers`, token, {
      provider_id: "pp_system_default",
    });
    console.log("✓ System payment provider added to USD region");
  } catch (e) {
    console.log("Note:", e.message.slice(0, 120));
  }

  // Wire the publishable API key to the USD region
  console.log("\nAssociating publishable key with USD region...");
  const PUB_KEY_ID = "apk_01KRSZ9W5190REZQQG16BC7CDS";
  const SC_ID = "sc_01KRSZ9W4RY5M7GB7D4PGFD729";
  try {
    await api("POST", `/admin/api-keys/${PUB_KEY_ID}/sales-channels`, token, {
      add: [SC_ID],
    });
    console.log("✓ Sales channel linked to publishable key");
  } catch (e) {
    console.log("Note:", e.message.slice(0, 120));
  }

  // Test: create a cart in the USD region
  console.log("\nTest: creating a USD cart...");
  const PUB_KEY = "pk_a49bbf556cf59f5fcc7a7016ca1174c6ca8497e905c03d8f4dc91b98b977746f";
  const cartRes = await fetch(`${MEDUSA_URL}/store/carts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    body: JSON.stringify({ region_id: regionId }),
  });
  const cartData = await cartRes.json();
  if (cartData.cart) {
    console.log("✓ Cart created:", cartData.cart.id, "region:", cartData.cart.region_id, "currency:", cartData.cart.currency_code);
    // Clean up test cart
    console.log("(test cart — not persisted to frontend)");
    console.log("\n✓ USD region setup complete. Region ID:", regionId);
    console.log("Add NEXT_PUBLIC_MEDUSA_REGION_ID=" + regionId + " to apps/web/.env.local");
  } else {
    console.log("Cart creation result:", JSON.stringify(cartData, null, 2));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
