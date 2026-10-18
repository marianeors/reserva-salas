import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/features/auth/components/user-menu";
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
  title: { default: "Reserva de Salas", template: "%s · Reserva de Salas" },
  description: "Sistema interno de reserva de salas de reunião.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <Link href="/salas" className="font-semibold">
              Reserva de Salas
            </Link>
            <Link href="/salas" className="text-sm text-muted-foreground hover:text-foreground">
              Salas
            </Link>
            <div className="ml-auto">
              <Suspense fallback={null}>
                <UserMenu />
              </Suspense>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
