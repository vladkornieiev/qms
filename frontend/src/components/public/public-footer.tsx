import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export function PublicFooter() {
  return (
    <footer className="bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark pt-16 pb-10">
      <div className="max-w-[960px] mx-auto px-4 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link
            href="/"
            className="flex items-center text-foreground-dark dark:text-foreground-light opacity-80"
          >
            <span className="flex items-center gap-2 text-lg font-black tracking-tight">
              <Zap className="size-5 text-public-primary" />
              ASAP
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-text-muted hover:text-public-primary text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} ASAP Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
