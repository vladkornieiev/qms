import { FileCheck, Receipt, Package, Users } from "lucide-react";

const solutions = [
  {
    title: "Quotes & Invoicing",
    icon: FileCheck,
    description:
      "Create professional quotes, convert them to invoices with one click, and track payments. Built-in versioning, line items, and PDF generation keep your pipeline moving.",
  },
  {
    title: "Project Management",
    icon: Receipt,
    description:
      "Manage projects from lead to completion. Assign resources, track date ranges, monitor budgets, and see real-time profit margins all in one place.",
  },
  {
    title: "Inventory & Products",
    icon: Package,
    description:
      "Track serialized equipment and consumable stock with check-out/check-in workflows, barcode support, and automatic low-stock alerts.",
  },
  {
    title: "Resource Scheduling",
    icon: Users,
    description:
      "Schedule contractors and employees with availability calendars, rate management, payout tracking, and utilization reporting.",
  },
];

export function SolutionsSection() {
  return (
    <section className="w-full py-16 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-foreground-dark dark:text-foreground-light mb-10 text-center uppercase">
          Everything You Need to Run Your Business
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </div>
    </section>
  );
}
