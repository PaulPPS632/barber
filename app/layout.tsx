import "@/styles/globals.css";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Barber.pe – El sistema de gestión para tu barbería",
    template: "%s | Barber.pe",
  },
  description:
    "Automatiza citas, gestiona clientes y potencia tu barbería con IA a través de WhatsApp.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#050506",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-[#050506] text-[#EDEDEF] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
