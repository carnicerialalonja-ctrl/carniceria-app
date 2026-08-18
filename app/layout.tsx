import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "./AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://la-lonja-celaya-oficial.vercel.app"),
  title: {
    default: "Carnicería La Lonja | Cortes y carne en Celaya",
    template: "%s | Carnicería La Lonja",
  },
  description:
    "Catálogo y pedidos de Carnicería La Lonja en el Mercado Morelos de Celaya. Cortes de res, cerdo, pollo, preparados y promociones.",
  keywords: [
    "carnicería en Celaya",
    "Carnicería La Lonja",
    "carne a domicilio Celaya",
    "Mercado Morelos",
    "cortes de carne",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "Carnicería La Lonja",
    title: "Carnicería La Lonja | Desde 1900 en Celaya",
    description: "Consulta el catálogo, promociones y arma tu pedido en línea.",
    images: [{ url: "/portada-lonja.png", alt: "Carnicería La Lonja en Celaya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carnicería La Lonja | Celaya",
    description: "Catálogo, promociones y pedidos de carne en Celaya.",
    images: ["/portada-lonja.png"],
  },
  robots: { index: true, follow: true },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ButcherShop",
  name: "Carnicería La Lonja",
  url: "https://la-lonja-celaya-oficial.vercel.app",
  telephone: "+52 461 349 9246",
  image: "https://la-lonja-celaya-oficial.vercel.app/portada-lonja.png",
  foundingDate: "1900",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Mercado Morelos, local interior 96",
    addressLocality: "Celaya",
    addressRegion: "Guanajuato",
    addressCountry: "MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
