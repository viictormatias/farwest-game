import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Far West - RPG de Duelo",
  description: "Um RPG de faroeste com duelos entre pistoleiros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

