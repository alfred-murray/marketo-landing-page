import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MunchkinScript } from "./components/MunchkinScript";

export const metadata: Metadata = {
  title: "Lattice — Banking-grade infrastructure for modern fintechs",
  description:
    "Issue cards, move money, and stay compliant on a single API. Lattice powers the next generation of fintech with banking-grade rails and millisecond observability.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Lattice — Banking-grade infrastructure for modern fintechs",
    description:
      "Issue cards, move money, and stay compliant on a single API.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-ink antialiased">
        <MunchkinScript />
        {children}
      </body>
    </html>
  );
}
