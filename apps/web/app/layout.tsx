import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AuthProvider } from "@/components/auth/auth-context";
import { AnnouncementBar } from "@/components/announcement-bar";
import { RevealObserver } from "@/components/reveal-observer";
import { PostHogProvider } from "@/components/posthog-provider";

/**
 * Ekster — the studio typeface, loaded locally so it ships from our own
 * origin (no third-party request, better LCP). Five weights cover the range
 * from hairline display headings to medium UI labels.
 */
const ekster = localFont({
  src: [
    { path: "./fonts/Ekster-Thin.ttf", weight: "200", style: "normal" },
    { path: "./fonts/Ekster-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Ekster-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Ekster-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Ekster-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-ekster",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Yixing clay tea pets",
    "zisha tea pet",
    "茶宠",
    "purple clay figurine",
    "gongfu tea accessories",
    "handmade Chinese teaware",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_US",
    images: [
      {
        url: "/images/getty_pots.jpg",
        width: 1200,
        height: 800,
        alt: "A shelf of handmade Yixing clay tea pets by PO/ET",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/images/getty_pots.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ekster.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema()),
          }}
        />
      </head>
      <body className="grain antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[9999] -translate-y-20 rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <AnnouncementBar />
        <PostHogProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </PostHogProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
