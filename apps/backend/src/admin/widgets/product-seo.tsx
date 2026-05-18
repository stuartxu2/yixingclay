import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/types"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useState } from "react"
import { sdk } from "../lib/sdk"

/**
 * Product metadata keys this widget manages. The storefront reads the same
 * keys to build <title>/<meta description> tags and the Product JSON-LD
 * (clay type / artisan / capacity) — see apps/web. Editing them here means
 * editors never touch raw metadata JSON.
 */
const FIELDS = [
  {
    key: "seo_title",
    label: "SEO title",
    hint: "Browser tab and Google result heading. Keep it under ~60 characters.",
    multiline: false,
  },
  {
    key: "seo_description",
    label: "SEO description",
    hint: "The snippet shown under the title in search results. ~155 characters.",
    multiline: true,
  },
  {
    key: "clay_type",
    label: "Clay type / 泥料",
    hint: "e.g. Zisha 紫泥, Zhuni 朱泥, Duanni 段泥. Surfaced in Product structured data.",
    multiline: false,
  },
  {
    key: "artisan",
    label: "Artisan / 艺人",
    hint: "The maker's name. Shown on the product page and in JSON-LD.",
    multiline: false,
  },
  {
    key: "capacity",
    label: "Capacity / 容量",
    hint: "e.g. 150ml, 220ml.",
    multiline: false,
  },
] as const

const ProductSeoWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const meta = (data.metadata ?? {}) as Record<string, unknown>
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, String(meta[f.key] ?? "")]))
  )
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      // Spread the existing metadata first so unrelated keys are preserved.
      await sdk.admin.product.update(data.id, {
        metadata: { ...meta, ...form },
      })
      toast.success("SEO & discoverability details saved")
    } catch (e) {
      toast.error(`Could not save: ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">SEO &amp; AI discoverability</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Powers the storefront&apos;s meta tags and Product structured data.
          </Text>
        </div>
        <Button size="small" onClick={save} isLoading={saving}>
          Save
        </Button>
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex flex-col gap-y-1">
            <Label size="small" weight="plus">
              {f.label}
            </Label>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {f.hint}
            </Text>
            {f.multiline ? (
              <Textarea
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : (
              <Input
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductSeoWidget
