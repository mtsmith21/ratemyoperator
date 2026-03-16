import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RateMyOperator — Private Jet Operator Reviews",
    template: "%s | RateMyOperator",
  },
  description: "Honest, verified reviews of private jet operators worldwide. Find the best charter, fractional, and membership operators rated on safety, service, punctuality, and value.",
  keywords: ["private jet reviews", "charter operator reviews", "fractional jet", "private aviation", "jet card", "NetJets review", "VistaJet review"],
  authors: [{ name: "RateMyOperator" }],
  creator: "RateMyOperator",
  metadataBase: new URL("https://www.ratemyoperator.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ratemyoperator.com",
    siteName: "RateMyOperator",
    title: "RateMyOperator — Private Jet Operator Reviews",
    description: "Honest, verified reviews of private jet operators worldwide. Rated on safety, service, punctuality, and value.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RateMyOperator — Private Jet Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RateMyOperator — Private Jet Operator Reviews",
    description: "Honest, verified reviews of private jet operators worldwide.",
    images: ["/og-image.png"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
