import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures fetchMock is available when vi.mock factory is hoisted.
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

// Mock the Medusa SDK client used by lib/search.ts.
vi.mock("./medusa", () => ({
  medusa: { client: { fetch: fetchMock } },
}));

import { searchProducts } from "./search";

beforeEach(() => {
  fetchMock.mockReset();
});

describe("searchProducts", () => {
  it("returns [] for an empty query without calling the API", async () => {
    expect(await searchProducts("   ")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a tea-pet hit and requests metadata in the fields param", async () => {
    fetchMock.mockResolvedValue({
      products: [
        {
          id: "prod_1",
          title: "The White Cat",
          handle: "cat",
          thumbnail: "https://x.blob.core.windows.net/cat.jpg",
          metadata: null,
          variants: [{ prices: [{ amount: 6800, currency_code: "usd" }] }],
        },
      ],
    });

    const results = await searchProducts("cat");

    expect(results).toEqual([
      {
        id: "prod_1",
        title: "The White Cat",
        handle: "cat",
        thumbnail: "https://x.blob.core.windows.net/cat.jpg",
        price: 6800,
        href: "/tea-pets/cat",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/store/meilisearch/products",
      expect.objectContaining({
        query: expect.objectContaining({
          query: "cat",
          limit: 8,
          fields: expect.stringContaining("*metadata"),
        }),
      }),
    );
  });

  it("routes a teapot hit to /teapots/{handle}", async () => {
    fetchMock.mockResolvedValue({
      products: [
        {
          id: "prod_2",
          title: "Shi Piao",
          handle: "shi-piao",
          thumbnail: null,
          metadata: { kind: "teapot" },
          variants: [{ prices: [{ amount: 12000, currency_code: "usd" }] }],
        },
      ],
    });

    const [r] = await searchProducts("shi");
    expect(r.href).toBe("/teapots/shi-piao");
  });

  it("returns [] when the API call throws", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    expect(await searchProducts("cat")).toEqual([]);
  });

  it("defaults price to 0 when no usd price is present", async () => {
    fetchMock.mockResolvedValue({
      products: [
        { id: "p", title: "T", handle: "h", thumbnail: null, metadata: null, variants: [] },
      ],
    });
    const [r] = await searchProducts("t");
    expect(r.price).toBe(0);
  });
});
