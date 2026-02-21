import Link from "next/link";
import { Linkedin, Mail, Phone } from "lucide-react";
import Image from "next/image";

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
            <Image
              src="/vaporsafe-logo.png"
              alt="VaporSafe"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
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
          <div className="flex items-center gap-4">
            <Link
              href="tel:805-899-8142"
              className="text-text-muted hover:text-public-primary transition-colors flex items-center gap-1 text-sm"
            >
              <Phone className="size-4" />
              <span className="hidden sm:inline">805-899-8142</span>
            </Link>
            <Link
              href="mailto:sales@vaporsafe.io"
              className="text-text-muted hover:text-public-primary transition-colors"
            >
              <Mail className="size-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/vaporsafe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-public-primary transition-colors"
            >
              <Linkedin className="size-5" />
            </Link>
          </div>
        </div>
        <div className="text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} VaporSafe. All rights reserved.
            <br />
            World leaders in real-time chemical emissions & odor monitoring.
          </p>
        </div>
      </div>
    </footer>
  );
}
