import Link from "next/link";

export function ResellersSection() {
  return (
    <section className="w-full py-12 px-4 bg-background-dark text-white">
      <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h3 className="text-xl font-bold uppercase">
            Looking for a Custom Solution?
          </h3>
          <p className="text-text-muted text-sm">
            Need custom integrations, dedicated support, or enterprise
            deployment? We can help.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 border border-text-muted rounded-lg hover:bg-surface-dark hover:border-white transition-all text-sm font-bold uppercase tracking-wider"
        >
          Contact Sales
        </Link>
      </div>
    </section>
  );
}
