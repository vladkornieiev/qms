"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const navigation = [
  { name: "Solutions", href: "/solutions" },
  { name: "About", href: "/about" },
  { name: "FAQs", href: "/faqs" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-[1280px] mx-auto">
        <Link
          href="/"
          className="flex items-center text-foreground-dark dark:text-foreground-light"
        >
          <span className="flex items-center gap-2 text-xl font-black tracking-tight">
            <Zap className="size-6 text-public-primary" />
            ASAP
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex flex-1 justify-end gap-6 items-center">
          <nav className="flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-text-muted hover:text-public-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="h-4 w-px bg-border-light dark:bg-text-muted" />
          <Link
            href="/login"
            className="text-sm font-bold px-4 py-2 rounded border border-public-primary text-public-primary hover:bg-public-primary hover:text-white transition-all duration-200"
          >
            Login
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden text-foreground-dark dark:text-foreground-light"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="size-6" />
          ) : (
            <Menu className="size-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-text-muted hover:text-public-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border-light dark:border-border-dark pt-4 flex flex-col gap-4">
              <Link
                href="/login"
                className="text-sm font-bold px-4 py-2 rounded border border-public-primary text-public-primary hover:bg-public-primary hover:text-white transition-all duration-200 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
