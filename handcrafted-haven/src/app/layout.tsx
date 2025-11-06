import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Handcrafted Haven",
  description: "Marketplace for artisan-made goods",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <header className="border-b">
          <Navbar />
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="border-t">
          <div className="container mx-auto flex items-center justify-between p-4 text-sm text-neutral-600">
            <p>© {new Date().getFullYear()} Handcrafted Haven</p>
            <a className="hover:underline" href="/accessibility">Accessibility</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
