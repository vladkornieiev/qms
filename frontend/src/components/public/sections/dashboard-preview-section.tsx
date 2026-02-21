import { TrendingUp, DollarSign, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardPreviewSection() {
  return (
    <section className="w-full py-16 px-4 md:px-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-[960px] mx-auto flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-foreground-dark dark:text-foreground-light mb-2">
            Real-time visibility into your business
          </h3>
          <p className="text-sm text-text-muted">
            Your dashboard surfaces revenue metrics, pipeline health, resource
            utilization, and inventory alerts so you can act fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {/* Revenue card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-bold text-foreground-dark dark:text-foreground-light mb-1">
                  Revenue Overview
                </h4>
                <p className="text-sm text-text-muted">Monthly snapshot</p>
              </div>
              <DollarSign className="size-5 text-public-primary" />
            </div>
            <div className="flex items-end gap-8">
              <div>
                <span className="text-3xl font-black text-foreground-dark dark:text-foreground-light tracking-tight">
                  $124,850
                </span>
                <span className="text-sm text-green-600 ml-2 font-bold">+12%</span>
              </div>
              <div className="flex gap-1 items-end h-16">
                {[40, 55, 35, 65, 50, 80, 70, 90, 85, 95, 75, 100].map((h, i) => (
                  <div
                    key={i}
                    className="w-3 bg-public-primary/20 rounded-t"
                    style={{ height: `${h}%` }}
                  >
                    <div
                      className="w-full bg-public-primary rounded-t"
                      style={{ height: `${Math.min(h + 10, 100)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline card */}
          <div className="md:col-span-1 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Pipeline
              </span>
              <TrendingUp className="size-4 text-public-primary" />
            </div>
            <div className="space-y-2">
              {[
                { label: "Leads", count: 12, color: "bg-blue-500" },
                { label: "Quoted", count: 8, color: "bg-yellow-500" },
                { label: "Won", count: 5, color: "bg-green-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-text-muted flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-foreground-dark dark:text-foreground-light">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization card */}
          <div className="md:col-span-1 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Utilization
              </span>
              <Users className="size-4 text-public-primary" />
            </div>
            <div>
              <span className="text-4xl font-black text-foreground-dark dark:text-foreground-light tracking-tight">
                78%
              </span>
            </div>
            <div className="w-full bg-border-light dark:bg-text-muted h-2 rounded-full overflow-hidden">
              <div className="bg-public-primary h-full w-[78%] rounded-full" />
            </div>
            <span className="text-xs text-text-muted">
              14 of 18 resources booked this week
            </span>
          </div>

          {/* CTA card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm flex flex-col md:flex-row items-center p-6 gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-foreground-dark dark:text-foreground-light mb-2">
                Built for Teams of Any Size
              </h4>
              <p className="text-sm text-text-muted mb-4">
                From solo freelancers to growing agencies, ASAP scales with your
                business. Multi-tenant architecture means each organization gets
                its own secure workspace.
              </p>
              <Link
                href="/login"
                className="text-public-primary text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Start Your Free Trial
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex gap-4">
              {["CRM", "Projects", "Billing"].map((label) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="size-2 rounded-full bg-public-secondary mb-1" />
                  <span className="text-[10px] uppercase text-text-muted font-bold">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
