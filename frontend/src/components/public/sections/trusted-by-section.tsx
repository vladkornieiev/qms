const _partners = [];

export function TrustedBySection() {
  return (
    <section className="w-full border-y border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <p className="text-text-muted text-sm font-semibold tracking-wider uppercase text-center mb-6">
          Trusted by leading environmental consultancies
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {/* {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-2 text-foreground-dark dark:text-border-light"
            >
              <partner.icon className="size-5" />
              <span className="font-bold text-lg">{partner.name}</span>
            </div>
          ))} */}
        </div>
      </div>
    </section>
  );
}
