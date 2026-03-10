import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WishlistProvider } from "@/contexts/WishlistContext";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Car2Hand | พบรถมือสองคุณภาพที่คุณมั่นใจ",
  description: "Marketplace for second-hand cars with AI valuation and mechanic check. Buy and sell with confidence.",
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable}`}>
      <body className="font-sans antialiased bg-surface text-gray-800 flex flex-col min-h-screen">
        <WishlistProvider>
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}
