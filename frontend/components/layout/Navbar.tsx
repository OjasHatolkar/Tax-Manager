"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import AuthButtons from "./AuthButtons";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Who It's For", href: "#who-its-for" },
  { label: "Trust & Privacy", href: "#trust-privacy" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-cream-50/90 backdrop-blur">
      <nav
        aria-label="Primary"
        className="container-max flex h-16 items-center justify-between section-pad"
      >
        <Link href="/" className="flex items-center" aria-label="Tax Help home">
          <Logo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-ink-700 transition-colors hover:text-forest-800"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <AuthButtons
            linkClassName="text-sm font-medium text-ink-700 transition-colors hover:text-forest-800"
            labelClassName="text-sm text-ink-700"
          />
          <Button href="/assessment" size="md">
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-ink-700 hover:bg-forest-50 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-forest-100 bg-cream-50 md:hidden"
        >
          <ul className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-base font-medium text-ink-700 hover:bg-forest-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2 border-t border-forest-100 pt-3">
              <div className="flex items-center justify-between px-2 py-2.5">
                <AuthButtons
                  linkClassName="text-base font-medium text-ink-700 hover:text-forest-800"
                  labelClassName="text-base text-ink-700"
                />
              </div>
            </li>
            <li className="pt-1">
              <Button href="/assessment" className="w-full">
                Get Started
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
