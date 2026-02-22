import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import Sidebar from "@/components/Sidebar/Sidebar";
import WhatsAppButton from "@/components/Floating/WhatsAppButton";
import "./globals.css";
import { Providers } from "@/components/Providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://psgustavocaro.cl'),
  title: {
    default: "Ps. Gustavo Caro | Psicólogo Clínico TCC en Santiago, Chile",
    template: "%s | Ps. Gustavo Caro"
  },
  description: "Psicólogo Clínico con Especialización en Terapia Cognitivo Conductual (TCC) por la Universidad de Chile. Atención online para ansiedad, depresión, TDAH y más. Agenda tu sesión hoy.",
  keywords: [
    "psicólogo Santiago",
    "psicólogo online Chile",
    "terapia cognitivo conductual",
    "TCC Chile",
    "psicólogo ansiedad",
    "psicólogo depresión",
    "TDAH adulto",
    "psicoterapia online",
    "Gustavo Caro psicólogo"
  ],
  authors: [{ name: "Ps. Gustavo Caro" }],
  creator: "Ps. Gustavo Caro",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://psgustavocaro.cl",
    siteName: "Ps. Gustavo Caro - Psicólogo Clínico TCC",
    title: "Ps. Gustavo Caro | Psicólogo Clínico TCC en Santiago",
    description: "Especialista en Terapia Cognitivo Conductual. Atención online profesional para tu bienestar emocional. Agenda tu primera sesión.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ps. Gustavo Caro - Psicólogo Clínico TCC"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Ps. Gustavo Caro | Psicólogo Clínico TCC",
    description: "Especialista en Terapia Cognitivo Conductual. Atención online profesional.",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Psychologist",
              "name": "Ps. Gustavo Caro",
              "description": "Psicólogo Clínico con Especialización en Terapia Cognitivo Conductual (TCC) por la Universidad de Chile.",
              "url": "https://psgustavocaro.cl",
              "telephone": "+56922409953",
              "email": "psi.gustavocaro@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Santiago",
                "addressCountry": "CL"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -33.4489,
                "longitude": -70.6693
              },
              "priceRange": "$$$",
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "19:00"
              },
              "sameAs": [],
              "areaServed": {
                "@type": "Country",
                "name": "Chile"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servicios de Psicoterapia",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Sesión de Psicoterapia Individual",
                      "description": "Sesión de 45 minutos de terapia cognitivo conductual online"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Evaluación Clínica",
                      "description": "Evaluación psicológica completa con instrumentos estandarizados"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${dmSans.variable}`}>
        <Providers>
          <Sidebar />
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
