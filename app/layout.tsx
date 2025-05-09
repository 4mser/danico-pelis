import type { Metadata } from "next";
import Head from "next/head";
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
    locale: "es_ES", // Cambiado a guión bajo
    images: [
      {
        url: "https://pelis-barnico.vercel.app/us.png",
        width: 1200,
        height: 630,
        alt: "Nosotros 🖤",
        type: "image/png", // Especificar tipo MIME
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
      {
        url: "https://pelis-barnico.vercel.app/us.png",
        width: 1200,
        height: 630,
        alt: "Nosotros 🖤",
      },
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
      <Head>
        {/* Etiquetas OpenGraph adicionales para WhatsApp */}
        <meta property="og:image" content="https://pelis-barnico.vercel.app/us.png" />
        <meta property="og:image:secure_url" content="https://pelis-barnico.vercel.app/us.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Nosotros 🖤" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://pelis-barnico.vercel.app/us.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <meta name="twitter:image:alt" content="Nosotros 🖤" />
        
        {/* Cache control para WhatsApp */}
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}