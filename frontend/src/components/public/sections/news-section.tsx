import { Rocket, Zap, Shield } from "lucide-react";

const features = [
  {
    category: "Feature",
    title: "Workflow Automation",
    description:
      "Set up trigger-based rules to automate repetitive tasks — send emails, update statuses, and create notifications automatically.",
    icon: Zap,
  },
  {
    category: "Integration",
    title: "Connect Your Tools",
    description:
      "Sync with accounting software, calendar apps, and payment processors to keep your data flowing seamlessly.",
    icon: Rocket,
  },
  {
    category: "Security",
    title: "Enterprise-grade Security",
    description:
      "Row-level security, role-based access control, and encrypted credentials ensure your data stays safe.",
    icon: Shield,
  },
];

export function NewsSection() {
  return (
    <section className="w-full py-16 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-10 text-center">
          Built for Growth
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-3 group"
            >
              <div className="aspect-video bg-border-light dark:bg-surface-dark rounded-lg w-full overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  <feature.icon className="size-10" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-public-primary uppercase">
                  {feature.category}
                </span>
                <h3 className="font-bold text-foreground-dark dark:text-foreground-light group-hover:text-public-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted line-clamp-2">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
