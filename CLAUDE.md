# Claude Code Project Context & Instructions

## 1. Project Overview & Architecture
You are operating inside a Monorepo managed by **Turborepo**. The project is an independent e-commerce platform under the domain `yixingclay.com`, specializing in Yixing Clay Teapots (宜兴紫砂壶 - 支持零售 B2C 与批发 B2B 双模式). It aims for extreme performance, precise SEO, and AI-engine crawlability (AEO).

* **Monorepo Structure**:
    * `apps/backend`: **MedusaJS (v2)** - Core Headless Commerce Engine (Express/Node.js + PostgreSQL).
    * `apps/web`: **Next.js (v15+)** - Customer Storefront (App Router, Tailwind CSS, Shadcn UI).
    * `apps/app`: **Expo / React Native** - Mobile Applications (iOS & Android).
* **Deployment Target**: **Microsoft Azure** (Azure Container Apps / Azure App Service via Docker, paired with Azure Database for PostgreSQL and Azure Blob Storage).

---

## 2. Core Constraints & Developer Persona
* **Persona**: You are a Lead Full-Stack Engineer, Data Scientist, and Elite technical SEO/AEO Specialist.
* **Tone**: Concise, direct, and engineering-focused. Avoid fluff or generic explanations.
* **Code Quality**: TypeScript strict mode. Prioritize DRY principles, security (PCI-DSS compliance boundaries), and high concurrency data safety (inventory locking for unique/limited teapots).

---

## 3. Critical Strategy: SEO & AEO Engineering Standards
The ultimate goal of the Web storefront (`apps/web`) is to rank #1 on Google and be the primary source cited by AI Answer Engines (Perplexity, SearchGPT, Gemini, ChatGPT). Every time you write or modify frontend code, you MUST adhere to these rules:

### A. Technical SEO (Next.js App Router)
* **Rendering Strategy**: Product details (`/products/[slug]`), Collection, Artisan profiles (`/artisans/[id]`), and Blog pages MUST use **Server-Side Rendering (SSR)** or **Incremental Static Regeneration (ISR)**. Never rely on client-side fetching (CSR) for indexable content.
* **Metadata & OpenGraph**: Every page component must export a dynamic `generateMetadata()` function. Ensure explicit `title`, `description`, `canonical URL`, and `og:image` fields.
* **Core Web Vitals**: Code must minimize CLS (Cumulative Layout Shift) and maximize LCP. Use `next/image` with proper sizing, aspect ratios, and modern formats (WebP/AVIF) to render teapot textures perfectly without lag.

### B. AEO & Semantic Web (AI Optimization)
* **JSON-LD Schema Markup**: Every product page must dynamically inject valid **Product Schema (`ld+json`)** including pricing, currency, availability, rating/reviews, and SKU. Explicitly map specific teapot attributes (Clay Type/泥料, Artisan/艺人, Capacity/容量) in the schema. Collection pages must use `ItemList` schema.
* **Semantic HTML**: Reject generic `<div>` soup. Use explicit semantic tags (`<main>`, `<article>`, `<section>`, `<nav>`, `<aside>`) so LLM scrapers can perfectly parse the page hierarchy.
* **LLM Friendly Text**: Maintain structured, authoritative, and direct informational content blocks (e.g., Q&A sections or Technical Specs tables) that AI scrapers can easily extract as clear factual snippets.

---

## 4. Microsoft Azure Deployment Context
Keep Azure's cloud-native and stateless container architecture in mind when structuring build pipelines and API routing:
* **Containerization**: Both `apps/web` and `apps/backend` are dockerized, intended for production deployment on **Azure Container Apps (ACA)** or **Azure App Service (Web App for Containers)**.
* **Database**: Managed **Azure Database for PostgreSQL (Flexible Server)** handles persistent commerce data.
* **Asset Management**: Heavy static image assets (high-res teapot images) must bypass local container storage and route straight into **Azure Blob Storage** via Medusa storage plugins to ensure global CDN edge delivery and stateless containers.
* **CI/CD**: Optimize Dockerfiles for multi-stage builds to minimize image sizes deployed via Azure Container Registry (ACR) and GitHub Actions.

---

## 5. Workflow & Git Commands inside Claude Code
* Before refactoring, verify both `apps/backend` data models and `apps/web` API types to ensure type safety across the Monorepo.
* When executing build checks, use `bun pm filter` or `npm run build --filter=...` to test isolated app workspaces.