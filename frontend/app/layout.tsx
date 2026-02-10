import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: 'FixItMy',
  description: 'Community reporting and issue tracking platform',
  manifest: '/manifest.json'
};

export const viewport = {
  themeColor: "#0f172a",
};

import InstallPrompt from "@/shared/components/InstallPrompt";
import OfflineIndicator from "@/shared/components/OfflineIndicator";
import Footer from "@/shared/components/Footer";
import ClientProviders from "@/shared/components/ClientProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          {/* <OfflineIndicator /> */}
          <InstallPrompt />
        </ClientProviders>
      </body>
    </html>
  );
}
