import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ExclamationCircle } from "@medusajs/icons"
import { Badge, Container, Heading, Table, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"

// Teapots are one-of-a-kind, so "low" is deliberately small.
const LOW_STOCK_THRESHOLD = 3

type Variant = {
  inventory_quantity?: number
  manage_inventory?: boolean
}

type Product = {
  id: string
  title: string
  thumbnail?: string | null
  variants?: Variant[]
}

/**
 * Total stock across a product's inventory-managed variants.
 * Returns null when the product doesn't track inventory at all.
 */
const stockOf = (p: Product): number | null => {
  const managed = (p.variants ?? []).filter((v) => v.manage_inventory)
  if (!managed.length) {
    return null
  }
  return managed.reduce((sum, v) => sum + (v.inventory_quantity ?? 0), 0)
}

const StockWatchPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    sdk.admin.product
      .list({
        limit: 200,
        fields:
          "id,title,thumbnail,*variants,variants.inventory_quantity",
      })
      .then((res) => setProducts(res.products as unknown as Product[]))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(
    () =>
      products
        .map((product) => ({ product, stock: stockOf(product) }))
        .filter(
          (r): r is { product: Product; stock: number } =>
            r.stock !== null && r.stock <= LOW_STOCK_THRESHOLD
        )
        .sort((a, b) => a.stock - b.stock),
    [products]
  )

  const soldOut = rows.filter((r) => r.stock === 0).length
  const low = rows.length - soldOut

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Stock Watch</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          One-of-a-kind teapots that are sold out or running low (≤{" "}
          {LOW_STOCK_THRESHOLD} left).
        </Text>
      </div>

      <div className="flex gap-x-10 px-6 py-4">
        <div>
          <Text size="xlarge" weight="plus">
            {soldOut}
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Sold out
          </Text>
        </div>
        <div>
          <Text size="xlarge" weight="plus">
            {low}
          </Text>
          <Text size="small" className="text-ui-fg-subtle">
            Low stock
          </Text>
        </div>
      </div>

      {loading && (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">Loading…</Text>
        </div>
      )}

      {error && (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-error">{error}</Text>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="px-6 py-8">
          <Text className="text-ui-fg-subtle">
            Everything is well stocked. 🍵
          </Text>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Units left
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map(({ product, stock }) => (
              <Table.Row key={product.id}>
                <Table.Cell>
                  <div className="flex items-center gap-x-3">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-ui-bg-subtle" />
                    )}
                    <span>{product.title}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {stock === 0 ? (
                    <Badge color="red">Sold out</Badge>
                  ) : (
                    <Badge color="orange">Low</Badge>
                  )}
                </Table.Cell>
                <Table.Cell className="text-right">{stock}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Stock Watch",
  icon: ExclamationCircle,
})

export default StockWatchPage
