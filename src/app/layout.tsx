import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "./register-sw";
import { InstallPrompt } from "@/components/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trade Container — European Freight Exchange",
  description: "Connecting transporters with shippers across Europe. Post shipments, send offers and manage transport — all in one platform.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TRADE CONTAINER",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#EF4444",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo-pwa.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TRADE CONTAINER" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#EF4444" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RegisterServiceWorker />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
