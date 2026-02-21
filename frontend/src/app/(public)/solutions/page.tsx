import { Metadata } from "next";
import {
  Music,
  Monitor,
  Users,
  Briefcase,
  Package,
  Award,
  TrendingUp,
  Clock,
  FileText,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions - ASAP Platform",
  description:
    "See how ASAP Platform helps event production companies, AV service providers, staffing agencies, consulting firms, and rental businesses manage their operations end to end.",
};

const CATEGORY_CASE_STUDY = "Case Study";

const solutions = [
  {
    icon: Music,
    category: CATEGORY_CASE_STUDY,
    title: "Event Production Company Scales Operations",
    description:
      "A regional event production company eliminated spreadsheet chaos by moving their quoting, crew scheduling, and equipment tracking into ASAP Platform. Quote turnaround dropped from two days to under two hours, and double-bookings became a thing of the past.",
  },
  {
    icon: Monitor,
    category: CATEGORY_CASE_STUDY,
    title: "AV Services Provider Streamlines Billing",
    description:
      "An AV services firm struggled with billing delays caused by disconnected project and invoicing tools. After consolidating into ASAP Platform, they reduced invoice-to-payment cycle times by 40% and gained real-time visibility into project profitability.",
  },
  {
    icon: Users,
    category: CATEGORY_CASE_STUDY,
    title: "Staffing Agency Automates Resource Scheduling",
    description:
      "A staffing agency managing 200+ contractors used ASAP Platform's resource scheduling module to automate shift assignments and track utilization rates. Manual scheduling effort dropped by 60%, and client satisfaction scores improved.",
  },
  {
    icon: Briefcase,
    category: CATEGORY_CASE_STUDY,
    title: "Consulting Firm Centralizes Client Operations",
    description:
      "A boutique consulting firm replaced three separate tools—a CRM, a project tracker, and a billing system—with ASAP Platform. All client history, project milestones, and invoices now live in one place, giving principals instant visibility across the portfolio.",
  },
  {
    icon: Package,
    category: CATEGORY_CASE_STUDY,
    title: "Rental Business Eliminates Asset Conflicts",
    description:
      "An equipment rental company with a fleet of 500+ assets used ASAP Platform's inventory and check-in/check-out workflows to eliminate double-booking. Real-time availability data is now surfaced directly within the quoting workflow.",
  },
  {
    icon: Award,
    category: "Success Story",
    title: "Multi-Location Team Gains Single Source of Truth",
    description:
      "A service business operating across three cities struggled to coordinate teams and track project status remotely. ASAP Platform's cloud-native architecture gave every location real-time access to shared projects, resources, and client records.",
  },
  {
    icon: TrendingUp,
    category: "Success Story",
    title: "Growing Agency Shortens Sales Cycle",
    description:
      "By using ASAP Platform's templated quoting and automated follow-up workflows, a creative agency reduced their average sales cycle from three weeks to eight days. Win rates improved as proposals went out faster and more consistently.",
  },
  {
    icon: Clock,
    category: "Use Case",
    title: "Automated Invoicing from Completed Projects",
    description:
      "Teams across industries use ASAP Platform's workflow automation to trigger invoice generation the moment a project is marked complete. This eliminates billing lag and ensures no completed work goes unbilled.",
  },
  {
    icon: FileText,
    category: "Use Case",
    title: "Custom Reporting for Leadership Visibility",
    description:
      "Operations managers and executives use ASAP Platform's built-in reporting to monitor revenue pipelines, project margins, and resource utilization—without needing a separate BI tool or manual data exports.",
  },
  {
    icon: Calendar,
    category: "Use Case",
    title: "Field and Office Teams Stay in Sync",
    description:
      "Service businesses with mixed field and office teams rely on ASAP Platform's cloud-native access to keep everyone on the same page. Technicians in the field can update project status, log hours, and check resource assignments in real time.",
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-[960px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
            Solutions & Case Studies
          </h1>
          <p className="text-lg text-text-muted dark:text-border-light max-w-2xl mx-auto">
            Real-world examples of how ASAP Platform helps service businesses
            streamline operations, close deals faster, and deliver projects on
            time.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 px-4">
        <div className="max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution) => (
              <article
                key={solution.title}
                className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-public-primary/10 rounded-lg text-public-primary group-hover:bg-public-primary group-hover:text-white transition-colors">
                    <solution.icon className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-public-primary uppercase tracking-wider">
                    {solution.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light mb-3 group-hover:text-public-primary transition-colors">
                  {solution.title}
                </h3>
                <p className="text-sm text-text-muted dark:text-border-light leading-relaxed">
                  {solution.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <div className="max-w-[960px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-4">
            Ready to See It in Action?
          </h2>
          <p className="text-text-muted dark:text-border-light mb-8 max-w-xl mx-auto">
            Log in to explore ASAP Platform and discover how it can transform
            the way your business manages clients, projects, and resources.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 bg-public-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors uppercase"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
