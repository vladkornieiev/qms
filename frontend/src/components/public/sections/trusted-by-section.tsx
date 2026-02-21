export function TrustedBySection() {
  return (
    <section className="w-full border-y border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="max-w-[960px] mx-auto px-4 py-8">
        <p className="text-text-muted text-sm font-semibold tracking-wider uppercase text-center mb-6">
          Trusted by teams across industries
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-text-muted">
          {["Event Production", "AV Services", "Consulting", "Staffing", "Rental Companies"].map((industry) => (
            <span key={industry} className="text-sm font-bold uppercase tracking-wider">
              {industry}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
