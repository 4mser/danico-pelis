// app/layout.tsx
import Head from 'next/head';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        {/* Essential Meta */}
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>Barnico Pelis</title>
        <meta name="description" content="Pelis para ver juntitos" />
        <meta name="author" content="By Entropía" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Barnico Pelis" />
        <meta property="og:description" content="Pelis para ver juntitos" />
        <meta property="og:url" content="https://pelis-barnico.vercel.app/" />
        <meta
          property="og:image"
          content="https://pelis-barnico.vercel.app/us.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Barnico Pelis" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Barnico Pelis" />
        <meta
          name="twitter:description"
          content="Pelis para ver juntitos"
        />
        <meta
          name="twitter:image"
          content="https://pelis-barnico.vercel.app/us.png"
        />
        <meta
          name="twitter:url"
          content="https://pelis-barnico.vercel.app/"
        />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
