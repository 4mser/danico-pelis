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
  description: "Pelis para ver juntitos 🖤",
  // Iconos para favicon y accesos directos
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  // Robots
  robots: {
    index: true,
    follow: true,
  },
  // Open Graph (para compartir en redes sociales)
  openGraph: {
    type: "website",
    url: "https://pelis-barnico.vercel.app",
    title: "Pelis Barnico",
    description: "Pelis para ver juntitos 🖤",
    siteName: "MiSitio",
    images: [
      {
        url: "https://pelis-barnico.vercel.app/us.png",
        alt: "Imagen para compartir en redes sociales",
      },
    ],
    locale: "en-US",
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@TuUsuario",
    creator: "@TuUsuario",
    title: "Pelis Barnico",
    description: "Pelis para ver juntitos 🖤",
    images: ["https://pelis-barnico.vercel.app/us.png"],
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
