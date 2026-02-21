import { Metadata } from "next";
import {
  Building2,
  FileText,
  Clock,
  BarChart3,
  DollarSign,
  Shield,
  Users,
  Zap,
  Check,
  Package,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services - ASAP Platform",
  description:
    "ASAP Platform offers end-to-end business management services including CRM, quoting, invoicing, project management, inventory tracking, resource scheduling, and reporting.",
};

const highlights = [
  {
    icon: Clock,
    title: "Speed",
    description: "Generate professional quotes and proposals in minutes, not hours",
  },
  {
    icon: BarChart3,
    title: "Real-time Visibility",
    description: "Live dashboards across projects, resources, and financials",
  },
  {
    icon: DollarSign,
    title: "Revenue Clarity",
    description: "Track quotes, invoices, and payments in one unified workflow",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Multi-tenant architecture with role-based access and data isolation",
  },
];

const crmFeatures = [
  "Centralized client and contact management",
  "Track communication history and follow-ups",
  "Attach files, notes, and activity logs to client records",
  "Link clients directly to quotes, projects, and invoices",
  "Custom fields for industry-specific client data",
  "Search and filter across your entire client base",
];

const quotingFeatures = [
  "Build itemized quotes from reusable line items and templates",
  "Apply labor, materials, equipment, and markup in one view",
  "Send branded PDF quotes for client approval",
  "Convert approved quotes directly into projects and invoices",
  "Track quote status from draft through acceptance",
  "Version control for revised quotes",
];

const projectFeatures = [
  "Create and manage projects with tasks, milestones, and deadlines",
  "Assign team members and track progress in real time",
  "Link projects to quotes, invoices, and inventory",
  "Monitor project budgets vs. actuals",
  "Document uploads and notes per project",
  "Custom project statuses to match your workflow",
];

const serviceCategories = [
  {
    icon: Building2,
    id: "crm",
    title: "CRM & Client Management",
    subtitle: "Build stronger client relationships",
    features: crmFeatures,
    iconColor: "public-primary",
  },
  {
    icon: FileText,
    id: "quoting",
    title: "Quoting & Invoicing",
    subtitle: "Close deals and get paid faster",
    features: quotingFeatures,
    iconColor: "public-secondary",
  },
  {
    icon: Package,
    id: "projects",
    title: "Project Management",
    subtitle: "Deliver projects on time and on budget",
    features: projectFeatures,
    iconColor: "public-primary",
  },
];

const additionalServices = [
  {
    icon: Package,
    title: "Inventory & Asset Tracking",
    description:
      "Manage your equipment, materials, and assets with real-time availability tracking. Know what you have, where it is, and when it is due back—so you never double-book or miss a shortage.",
    benefits: [
      "Real-time stock and availability tracking",
      "Link inventory to quotes and projects",
      "Low-stock alerts and reorder triggers",
      "Asset check-in / check-out workflows",
    ],
  },
  {
    icon: Calendar,
    title: "Resource Scheduling",
    description:
      "Schedule staff, equipment, and facilities across jobs without conflicts. Visualize availability at a glance and optimize how your team's time is allocated.",
    benefits: [
      "Visual scheduling calendar for all resource types",
      "Conflict detection and availability checks",
      "Assign resources directly from project views",
      "Track utilization rates across your team",
    ],
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description:
      "Reduce manual work by automating repetitive tasks across your operation. Trigger follow-up reminders, status changes, and notifications based on your business rules.",
    benefits: [
      "Automated quote follow-up reminders",
      "Status-change triggers and notifications",
      "Invoice generation from completed projects",
      "Customizable approval workflows",
    ],
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    description:
      "Make data-driven decisions with built-in reports across revenue, project performance, resource utilization, and client activity. Export data or view live dashboards.",
    benefits: [
      "Revenue and pipeline reporting",
      "Project performance and profitability analysis",
      "Resource utilization metrics",
      "Custom report builder with export to CSV",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-[960px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
            Platform Services
          </h1>
          <p className="text-lg text-text-muted dark:text-border-light max-w-2xl mx-auto">
            ASAP Platform gives service businesses everything they need to
            manage clients, quotes, projects, inventory, and teams—all in one
            connected platform.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 px-4 bg-background-light dark:bg-background-dark">
        <div className="max-w-[960px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="p-3 bg-public-primary/10 rounded-full text-public-primary mb-4">
                  <item.icon className="size-6" />
                </div>
                <h3 className="font-bold text-foreground-dark dark:text-foreground-light mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-muted dark:text-border-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services */}
      {serviceCategories.map((service, idx) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-16 px-4 ${
            idx % 2 === 0
              ? "bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark"
              : "bg-background-light dark:bg-background-dark"
          }`}
        >
          <div className="max-w-[960px] mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-public-primary/10 rounded-lg text-public-primary">
                <service.icon className="size-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
                  {service.title}
                </h2>
                <p className="text-text-muted">{service.subtitle}</p>
              </div>
            </div>

            <ul className="grid md:grid-cols-2 gap-3">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="size-5 text-public-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-muted dark:text-border-light">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Additional Services Grid */}
      <section
        id="additional-services"
        className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark"
      >
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-public-secondary/10 rounded-lg text-public-secondary">
              <Users className="size-8" />
            </div>
            <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
              More Platform Capabilities
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {additionalServices.map((service) => (
              <div
                key={service.title}
                className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <service.icon className="size-6 text-public-primary" />
                  <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                    {service.title}
                  </h3>
                </div>
                <p className="text-sm text-text-muted dark:text-border-light mb-4 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-sm text-text-muted dark:text-border-light"
                    >
                      <Check className="size-4 text-public-primary flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-public-primary text-white">
        <div className="max-w-[960px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Sign in to explore ASAP Platform and see how it can streamline your
            entire business operation from day one.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-public-primary font-bold rounded-lg hover:bg-white/90 transition-colors uppercase"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
