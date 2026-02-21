export function PlatformSection() {
  return (
    <section className="w-full py-12 px-4 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark">
      <div className="max-w-[960px] mx-auto text-center">
        <span className="text-public-primary font-bold uppercase tracking-widest text-sm mb-2 block">
          The Platform
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-foreground-dark dark:text-foreground-light mb-6">
          ASAP: One Platform for Your Entire Business
        </h2>
        <p className="text-lg text-text-muted dark:text-border-light max-w-3xl mx-auto leading-relaxed">
          ASAP is a multi-tenant business management platform that connects your
          CRM, quoting, project management, invoicing, inventory, and resource
          scheduling into a single unified workspace. No more jumping between
          tools or reconciling spreadsheets.
        </p>
      </div>
    </section>
  );
}
