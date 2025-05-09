// app/layout.tsx
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
  title: "Barnico Pelis",
  description: "Pelis para ver juntitos",

  openGraph: {
    type: "website",
    url: "https://pelis-barnico.vercel.app/",
    title: "Barnico Pelis",
    description: "Pelis para ver juntitos",
    images: [
      {
        url: "https://pelis-barnico.vercel.app/us.png", // absoluta
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
    images: ["https://pelis-barnico.vercel.app/us.png"],
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
