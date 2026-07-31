import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grid Critique - AI Art Proportion & Color Analysis",
  description: "Canvas-based proportion grid critique and formal art analysis of color harmony, chiaroscuro, mood, and symbolism.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans" style={{ background: '#FAF7F2', color: '#3D2C2C' }}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
