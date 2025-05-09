// app/layout.tsx

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function generateMetadata(): Promise<Metadata> {
  const baseURL = "https://pelis-barnico.vercel.app";

  return {
    metadataBase: new URL(baseURL),          // ← establece la base
    title: "Barnico Pelis",
    description: "Pelis para ver juntitos",

    openGraph: {
      type: "website",
      title: "Barnico Pelis",
      description: "Pelis para ver juntitos",
      url: "/",                              // Next concatenará con metadataBase
      images: [
        {
          url: "/us.png",                    // ruta relativa a public/
          width: 1200,
          height: 630,
          alt: "Us",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Barnico Pelis",
      description: "Pelis para ver juntitos",
      images: ["/us.png"],
    },

    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)",  color: "#000000" },
    ],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
