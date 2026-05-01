import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, organizationSchema, websiteSchema } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex-sans-thai",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0F3460",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | แพลตฟอร์มซื้อขายรถมือสองที่โปร่งใส ปลอยภัย ยุติธรรม`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "รถมือสอง",
    "ขายรถมือสอง",
    "ซื้อรถมือสอง",
    "รถมือสองราคาถูก",
    "รถมือสองสภาพนางฟ้า",
    "ตลาดรถมือสอง",
    "Used cars for sale Thailand",
    "Car2Hand",
    "Used cars marketplace Thailand"
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "th-TH": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | แพลตฟอร์มซื้อขายรถมือสองที่โปร่งใส ปลอยภัย ยุติธรรม`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | แพลตฟอร์มซื้อขายรถมือสองที่โปร่งใส ปลอยภัย ยุติธรรม`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon.webp" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID as string;
const googleTagManagerId = process.env.NEXT_PUBLIC_GTM_ID as string;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground flex flex-col min-h-screen">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ServiceWorkerRegister />
        <ThemeProvider>
          <WishlistProvider>
            <Navbar />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
          </WishlistProvider>
        </ThemeProvider>
        <Analytics />
        <GoogleAnalytics gaId={googleAnalyticsId} />
        <GoogleTagManager gtmId={googleTagManagerId} />
      </body>
    </html>
  );
}
