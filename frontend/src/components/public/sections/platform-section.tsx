export function PlatformSection() {
  return (
    <section className="w-full py-12 px-4 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark">
      <div className="max-w-[960px] mx-auto text-center">
        <span className="text-public-primary font-bold uppercase tracking-widest text-sm mb-2 block">
          The Platform
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-foreground-dark dark:text-foreground-light mb-6">
          VaporSafe® as a Turn-key, Data as a Service (DaaS) Platform
        </h2>
        <p className="text-lg text-text-muted dark:text-border-light max-w-3xl mx-auto leading-relaxed">
          VaporSafe® functions as a turn-key Data as a Service (DaaS) platform
          for Environmental Consultants, stakeholders, and the Cannabis
          industry. We integrate chemical, weather, and indoor condition data
          through a secure web portal for real-time visualization and export.
        </p>
      </div>
    </section>
  );
}
