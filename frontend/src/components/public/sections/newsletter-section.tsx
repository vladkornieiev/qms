"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <section className="w-full py-12 px-4 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="max-w-[500px] mx-auto text-center">
        <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light mb-4">
          Subscribe for Updates
        </h3>
        <p className="text-sm text-text-muted mb-6">
          Stay informed about new features, integrations, and product updates.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded border border-text-muted dark:border-text-muted dark:bg-background-dark dark:text-foreground-light focus:border-public-primary focus:ring-public-primary text-sm px-4 py-2"
            placeholder="Enter your email"
            required
          />
          <button
            type="submit"
            className="bg-foreground-dark dark:bg-foreground-light text-white dark:text-foreground-dark px-6 py-2 rounded font-bold text-sm uppercase hover:opacity-90 transition-opacity"
          >
            Join
          </button>
        </form>
      </div>
    </section>
  );
}
