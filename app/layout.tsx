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

export const metadataBase = new URL("https://pelis-barnico.vercel.app");

export const metadata: Metadata = {
  title: "pelis barnico",
  description: "Creado por Nico jeje",

  // Open Graph
  openGraph: {
    type: "website",
    url: "/",                // Next.js concatenará con metadataBase
    title: "pelis barnico",
    description: "Creado por Nico jeje",
    images: [
      {
        url: "/us.png",      // ruta relativa a public/
        width: 1200,
        height: 630,
        alt: "us",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "pelis barnico",
    description: "Creado por Nico jeje",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
