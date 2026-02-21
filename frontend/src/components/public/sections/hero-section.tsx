import { Radar, BarChart3, ClipboardCheck, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center pt-16 pb-20 px-4 md:px-20 lg:px-40 bg-background-light dark:bg-background-dark">
      <div className="max-w-[1024px] w-full flex flex-col items-center text-center gap-10">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1 className="text-foreground-dark dark:text-foreground-light text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] tracking-[-0.02em] uppercase">
            PROBLEMS SOLVED IN REAL TIME
          </h1>
          <p className="text-public-primary font-bold text-base md:text-lg tracking-wider uppercase max-w-2xl mx-auto leading-relaxed">
            WE ARE THE WORLD LEADERS IN REAL-TIME CHEMICAL EMISSIONS & ODOR
            MONITORING.
          </p>
        </div>

        <div className="w-full max-w-2xl py-8 my-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border-light dark:bg-border-dark -z-10 transform -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-public-primary to-transparent -z-10 transform -translate-y-1/2 animate-pulse-slow" />

            <div className="flex flex-col items-center gap-3 bg-background-light dark:bg-background-dark px-2">
              <div className="size-16 rounded-full border-2 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center text-text-muted shadow-sm">
                <Radar className="size-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Instrument
              </span>
            </div>

            <div className="hidden sm:flex text-public-primary">
              <ArrowRight className="size-6" />
            </div>

            <div className="flex flex-col items-center gap-3 bg-background-light dark:bg-background-dark px-2">
              <div className="size-16 rounded-full border-2 border-public-primary/30 bg-surface-light dark:bg-surface-dark flex items-center justify-center text-public-primary shadow-sm">
                <BarChart3 className="size-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-public-primary">
                Data
              </span>
            </div>

            <div className="hidden sm:flex text-public-primary">
              <ArrowRight className="size-6" />
            </div>

            <div className="flex flex-col items-center gap-3 bg-background-light dark:bg-background-dark px-2">
              <div className="size-16 rounded-full border-2 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center text-foreground-dark dark:text-foreground-light shadow-sm">
                <ClipboardCheck className="size-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-dark dark:text-foreground-light">
                Insight
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <a
            href="mailto:sales@vaporsafe.io?subject=Technical Overview Request"
            className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-public-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-public-primary/20 uppercase"
          >
            Request a Technical Overview
          </a>
          <p className="text-sm text-text-muted mt-2">
            Precision monitoring for consultants, regulators, and operators.
          </p>
        </div>
      </div>
    </section>
  );
}
