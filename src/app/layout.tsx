import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Providers moved to individual pages to avoid hydration issues

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AvaliaNutri - Jogos Educacionais para Avaliação Nutricional",
  description: "Aprenda avaliação nutricional através de jogos interativos com dados reais brasileiros e abordagem ultra-iniciante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
