import { Check } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Create Your Organization",
    description:
      "Sign up in seconds and set up your workspace. Invite team members, configure roles, and customize your settings to match your workflow.",
    features: [
      "Multi-tenant workspace",
      "Role-based access control",
      "Custom fields and categories",
    ],
    primary: true,
  },
  {
    number: 2,
    title: "Start Managing Your Business",
    description:
      "Add clients, create quotes, manage projects, and send invoices — all from one dashboard. Track resources, inventory, and payments in real time.",
    showPreview: true,
    primary: false,
  },
];

export function GettingStartedSection() {
  return (
    <section className="w-full py-20 px-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light mb-12 text-center uppercase">
          Getting Started
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`flex items-center justify-center size-10 rounded-full font-bold ${
                    step.primary
                      ? "bg-public-primary text-white"
                      : "bg-foreground-dark dark:bg-foreground-light text-white dark:text-foreground-dark"
                  }`}
                >
                  {step.number}
                </span>
                <h3 className="text-xl font-bold text-foreground-dark dark:text-foreground-light">
                  {step.title}
                </h3>
              </div>
              <div className="pl-14">
                <p className="text-text-muted dark:text-border-light mb-4">
                  {step.description}
                </p>
                {step.features && (
                  <ul className="space-y-2">
                    {step.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-text-muted"
                      >
                        <Check className="size-4 text-public-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {step.showPreview && (
                  <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border-light dark:border-text-muted">
                    <div className="flex items-center justify-between mb-3 border-b border-border-light dark:border-text-muted pb-2">
                      <span className="text-xs font-bold uppercase text-text-muted">
                        Dashboard Preview
                      </span>
                      <span className="size-2 bg-public-secondary rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-border-light dark:bg-text-muted rounded w-3/4" />
                      <div className="h-2 bg-border-light dark:bg-text-muted rounded w-1/2" />
                      <div className="h-2 bg-border-light dark:bg-text-muted rounded w-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
