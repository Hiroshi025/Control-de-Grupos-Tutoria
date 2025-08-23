import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

import { Inter, Manrope } from "next/font/google";

import { AuthProvider } from "@/hooks/use-auth";

const geist = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Sistema de Control de Estudiantes Tutorados - ITSOEH",
  description:
    "Plataforma de gestión académica para el control y seguimiento de estudiantes tutorados del Instituto Tecnológico Superior del Occidente del Estado de Hidalgo",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
