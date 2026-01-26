import type { Metadata } from "next";
import WhatsAppButton from "@/components/Floating/WhatsAppButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ps. Gustavo Caro | Psicólogo Clínico y Educacional",
  description: "Psicólogo clínico U. Chile con enfoque en Terapia Cognitivo Conductual. Atención online para niños, adolescentes y adultos.",
  keywords: ["Psicólogo", "Chile", "Terapia Online", "TCC", "Gustavo Caro", "Salud Mental"],
  authors: [{ name: "Ps. Gustavo Caro" }],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ position: 'relative' }}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
