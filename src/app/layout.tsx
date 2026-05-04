import type { Metadata, Viewport } from "next";
import { Manrope, Bebas_Neue, Outfit, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const bebas = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
});

const outfit = Outfit({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const notoJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-jp",
});

export const metadata: Metadata = {
  title: "ROILOG",
  description: "ポーカートーナメント収支管理",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#dfe6ee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${manrope.variable} ${bebas.variable} ${outfit.variable} ${notoJP.variable}`}>
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
