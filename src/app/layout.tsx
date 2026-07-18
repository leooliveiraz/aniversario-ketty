import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baile de Máscaras - 15 Anos | Festa Marsala & Ouro",
  description: "Venha celebrar o inesquecível Baile de Máscaras em tom Marsala. Confirme sua presença e confira a lista de presentes!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-rose-900 selection:text-amber-200 min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
