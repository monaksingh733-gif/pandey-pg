import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "PANDEY PG — Luxury PG & Co-Living for Students and Professionals",
  description:
    "Five-star PG living with homely 3-time meals, 24/7 security, high-speed Wi-Fi and zero brokerage. Single, double and triple sharing rooms starting ₹6,500/month. Book your bed online instantly.",
  keywords: [
    "PANDEY PG",
    "Pandey PG Bangalore",
    "luxury PG",
    "PG accommodation",
    "student housing",
    "working professional PG",
    "bed booking",
    "co-living",
  ],
  openGraph: {
    title: "PANDEY PG — Experience Five-Star PG Living",
    description:
      "Unmatched comfort, hygienic homely meals and 24/7 security tailored for students and working professionals.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#120D0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..700&family=Plus+Jakarta+Sans:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23120D0A'/%3E%3Cpath d='M16 4.5 27.5 16 16 27.5 4.5 16Z' fill='none' stroke='%23C89D54' stroke-width='2'/%3E%3Cpath d='M16 10.5 21.5 16 16 21.5 10.5 16Z' fill='%23C89D54'/%3E%3C/svg%3E"
        />
      </head>
      <body className="bg-espresso font-sans text-sand antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
