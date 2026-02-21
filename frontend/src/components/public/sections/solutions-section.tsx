import { Building2, Leaf } from "lucide-react";

const solutions = [
  {
    title: "Vapor Intrusion",
    icon: Building2,
    description:
      "We solve vapor intrusion issues in days, not years, and have saved clients millions of dollars. Our real-time monitoring provides immediate answers that traditional sampling methods take months to deliver.",
  },
  {
    title: "Cannabis Odors",
    icon: Leaf,
    description:
      "Growers, regulators, and the public alike trust us to deliver science-based, independent data that strengthen communities and save money. Our objective monitoring resolves disputes and supports compliance.",
  },
];

export function SolutionsSection() {
  return (
    <section className="w-full py-16 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {solutions.map((solution) => (
          <div
            key={solution.title}
            className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-border-light dark:bg-text-muted rounded-lg text-public-primary">
                <solution.icon className="size-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground-dark dark:text-foreground-light uppercase tracking-tight">
                {solution.title}
              </h3>
            </div>
            <p className="text-text-muted dark:text-border-light leading-relaxed">
              {solution.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
