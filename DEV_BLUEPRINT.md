# Full-Stack E-Commerce Project Blueprint: yixingclay.com

## 1. Project Identity & Business Context
*   **Domain**: `yixingclay.com`
*   **Niche**: Premium Yixing Clay Teapots and teapets (宜兴紫砂壶) for both Retail (B2C) and Wholesale (B2B).
*   **Target Audience**: Global tea connoisseurs, collectors (Retail), and tea shops/distributors (Wholesale).
*   **Product Characteristics**: High average order value (AOV), heavy reliance on craft authenticity, artisan profiles, clay types (Zi Ni, Zhu Ni, Duan Ni, etc.), and visual/historical storytelling.

---

## 2. System Architecture & Monorepo Structure
We use a **Turborepo Monorepo** tracking a single Git repository for absolute type safety and synchronized cross-platform updates via Claude Code.

```text
yixingclay-monorepo/
├── apps/
│   ├── backend/       # MedusaJS v2 Core (Commerce Engine + Admin Dashboard)
│   ├── web/           # Next.js v15+ Storefront (B2C/B2B Web Portal)
│   └── app/           # Expo / React Native (iOS & Android App)
├── packages/
│   ├── ts-types/      # Shared TypeScript interfaces & API schema types
│   └── ui-theme/      # Shared Tailwind/Design Tokens for Web & App