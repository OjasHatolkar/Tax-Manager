import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxpertise — Understand your taxes, step by step",
  description:
    "Taxpertise is an AI-assisted guide that helps you understand potentially relevant tax benefits, find the right documents, and figure out your next steps in plain English. Educational guidance, not tax filing or professional advice.",
  keywords: [
    "Taxpertise",
    "tax guidance",
    "tax education",
    "W-2 taxes",
    "student taxes",
    "tax credits and deductions",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Taxpertise — Understand your taxes, step by step",
    description:
      "Plain-English guidance to help you find relevant tax benefits, documents, and next steps.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest-800 focus:px-4 focus:py-2 focus:text-cream-50"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
