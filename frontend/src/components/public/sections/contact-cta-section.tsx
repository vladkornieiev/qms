export function ContactCTASection() {
  return (
    <section className="w-full py-20 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-[600px] mx-auto text-center flex flex-col gap-6">
        <h2 className="text-3xl md:text-4xl font-black text-foreground-dark dark:text-foreground-light uppercase">
          Request a Quote
        </h2>
        <p className="text-text-muted dark:text-border-light">
          Ready to deploy the world&apos;s most advanced real-time monitoring
          solution? Our team is standing by to spec your project.
        </p>
        <a
          href="mailto:sales@vaporsafe.io?subject=Quote Request"
          className="mx-auto inline-flex items-center justify-center min-w-[200px] h-14 bg-public-primary hover:bg-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all uppercase tracking-wide"
        >
          Contact Us
        </a>
      </div>
    </section>
  );
}
