import { MapPin, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardPreviewSection() {
  return (
    <section className="w-full py-16 px-4 md:px-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-[960px] mx-auto flex flex-col gap-10">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-foreground-dark dark:text-foreground-light mb-2">
            Defensible data, delivered continuously.
          </h3>
          <p className="text-sm text-text-muted">
            Our DaaS platform transforms raw sensor output into actionable
            compliance reports, reducing liability and operational downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {/* Map visualization */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:opacity-100 transition-opacity"
              style={{
                backgroundImage:
                  "url('https://tile.openstreetmap.org/12/687/1635.png'), url('https://tile.openstreetmap.org/12/688/1635.png')",
                backgroundSize: "50% 100%, 50% 100%",
                backgroundPosition: "left center, right center",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Map overlay with marker */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -top-2 -left-2 size-4 bg-public-primary rounded-full animate-ping opacity-75" />
                <div className="size-4 bg-public-primary rounded-full border-2 border-white shadow-lg" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-light/90 to-transparent dark:from-background-dark/90">
              <div className="flex items-center gap-2 text-foreground-dark dark:text-foreground-light">
                <MapPin className="size-5 text-public-primary" />
                <span className="text-sm font-bold">
                  Santa Barbara, California
                </span>
              </div>
            </div>
          </div>

          {/* Benzene levels card */}
          <div className="md:col-span-1 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Benzene Levels
              </span>
              <CheckCircle className="size-4 text-public-secondary" />
            </div>
            <div>
              <span className="text-4xl font-black text-foreground-dark dark:text-foreground-light tracking-tight">
                0.04
              </span>
              <span className="text-sm text-text-muted ml-1">ppb</span>
            </div>
            <div className="w-full bg-border-light dark:bg-text-muted h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-public-primary h-full w-[20%]" />
            </div>
            <span className="text-xs text-text-muted mt-2">
              Live sensor reading • ID #4092
            </span>
          </div>

          {/* Trend chart */}
          <div className="md:col-span-1 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-0">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuASW3ajcbq7wRBcu0k05aQFQt7EF7gJiylVOPA-VL4_uN1Ih8eEBpQ1ELjSZLVws3B_mr0zeNzrMs0kfP3hvAbosEtX_Q2A6iOCCNZNwcEX1MwLU5lVJvpI-894kKLvg1tfdIXhA2krIvzcEXYPHA3glaAb1XJQ3eqafGLJ5JlDY0FtNRRLHabqCqU3R6ot8ZpGGaOhpobanSs_Hp9B6qmsYMFjx6U5pANsAySjAXoTNKQ4a-P10Hm51tOYP5U3yfErW98uJmw_VKyV')",
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider bg-white/50 dark:bg-black/50 px-2 py-1 rounded">
                24h Trend
              </span>
            </div>
          </div>

          {/* System health */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm flex flex-col md:flex-row items-center p-6 gap-6">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-foreground-dark dark:text-foreground-light mb-2">
                System Health
              </h4>
              <p className="text-sm text-text-muted mb-4">
                All instruments are calibrated and transmitting data within
                expected parameters.
              </p>
              <Link
                href="/dashboard"
                className="text-public-primary text-sm font-bold flex items-center gap-1 hover:underline"
              >
                View Full Report
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex gap-4">
              {["Network", "Power", "Server"].map((status) => (
                <div key={status} className="flex flex-col items-center gap-1">
                  <div className="size-2 rounded-full bg-public-secondary mb-1" />
                  <span className="text-[10px] uppercase text-text-muted font-bold">
                    {status}
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
