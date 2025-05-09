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
  title: "Pelis Barnico",
  description: "Para ver pelis juntitos 🖤",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://pelis-barnico.vercel.app",
    title: "Pelis Barnico",
    description: "Para ver pelis juntitos 🖤",
    siteName: "Pelis Barnico",
    locale: "es-ES",
    images: [
      {
        url: "https://pelis-barnico.vercel.app/us.png",
        alt: "Pelis Barnico: Mira pelis juntos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@BarnicoApp",
    creator: "@BarnicoApp",
    title: "Pelis Barnico",
    description: "Para ver pelis juntitos 🖤",
    images: [
      "https://pelis-barnico.vercel.app/us.png",
    ],
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
