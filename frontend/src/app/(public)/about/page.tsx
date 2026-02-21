import { Metadata } from "next";
import { Users, Globe, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "About - ASAP Platform",
  description:
    "ASAP Platform is a modern multi-tenant business management platform built for quotes, projects, invoicing, inventory, and resource scheduling.",
};

const teamMembers = [
  {
    name: "Product Lead",
    title: "Head of Product",
    description:
      "Drives the ASAP Platform roadmap with a focus on user experience and operational efficiency. Works closely with customers to translate real-world workflows into powerful platform features.",
  },
  {
    name: "Engineering Lead",
    title: "Head of Engineering",
    description:
      "Oversees platform architecture and engineering execution. Committed to building scalable, reliable, and secure multi-tenant infrastructure.",
  },
  {
    name: "Design Lead",
    title: "Head of Design",
    description:
      "Champions intuitive, accessible UI across every corner of the platform. Ensures teams can onboard quickly and work efficiently without extensive training.",
  },
  {
    name: "Customer Success Lead",
    title: "Head of Customer Success",
    description:
      "Partners with clients during onboarding and beyond to ensure they get maximum value from ASAP Platform. Gathers feedback that shapes future product iterations.",
  },
  {
    name: "Operations Lead",
    title: "Head of Operations",
    description:
      "Keeps internal processes running smoothly and ensures the platform scales to meet growing customer demand. Focused on reliability, uptime, and support.",
  },
  {
    name: "Integrations Lead",
    title: "Head of Integrations",
    description:
      "Builds and maintains connections between ASAP Platform and the tools businesses already use. Passionate about reducing friction through seamless data flow.",
  },
];

const values = [
  {
    title: "Operational Clarity",
    description:
      "We believe businesses run better when teams have a single source of truth for quotes, projects, invoices, and resources.",
  },
  {
    title: "Built for Real Work",
    description:
      "Every feature in ASAP Platform is designed around how service businesses actually operate—not how software vendors assume they do.",
  },
  {
    title: "Flexibility First",
    description:
      "From custom fields to configurable workflows, we give teams the power to adapt the platform to their unique processes.",
  },
  {
    title: "Security & Trust",
    description:
      "Multi-tenant architecture with strict data isolation means every organization's data stays private and protected.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-[960px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
            About ASAP Platform
          </h1>
          <p className="text-lg text-text-muted dark:text-border-light max-w-3xl mx-auto">
            ASAP Platform is a modern multi-tenant business management solution
            built to help service-based businesses manage their entire operation
            from a single platform—quotes, projects, invoicing, inventory, and
            resource scheduling all in one place.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 px-4">
        <div className="max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-text-muted dark:text-border-light">
                <p>
                  We started ASAP Platform because service businesses—event
                  production companies, AV providers, staffing agencies,
                  consultants, and rental operations—were being held back by
                  fragmented tools and manual processes.
                </p>
                <p>
                  Our mission is to give every team the operational backbone
                  they need to quote faster, deliver projects on time, invoice
                  accurately, and scale without the administrative overhead.
                </p>
                <p>
                  ASAP Platform is purpose-built for multi-tenant environments,
                  meaning multiple organizations can run independently on a
                  shared infrastructure with full data isolation and
                  role-based access controls.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
                Our Values
              </h2>
              <ul className="space-y-3">
                {values.map((value, index) => (
                  <li
                    key={index}
                    className="text-sm text-text-muted dark:text-border-light bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark"
                  >
                    <span className="font-bold text-foreground-dark dark:text-foreground-light block mb-1">
                      {value.title}
                    </span>
                    {value.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark"
      >
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-public-primary/10 rounded-lg text-public-primary">
              <Users className="size-8" />
            </div>
            <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
              Our Team
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl p-6"
              >
                <div className="size-20 rounded-full overflow-hidden mb-4 border-2 border-border-light dark:border-border-dark bg-public-primary/10 flex items-center justify-center">
                  <Users className="size-8 text-public-primary" />
                </div>
                <h3 className="font-bold text-foreground-dark dark:text-foreground-light mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-public-primary font-medium mb-3">
                  {member.title}
                </p>
                <p className="text-sm text-text-muted dark:text-border-light leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Reach Section */}
      <section id="platform" className="py-16 px-4">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-public-secondary/10 rounded-lg text-public-secondary">
              <Globe className="size-8" />
            </div>
            <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
              Built for Scale
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="size-6 text-public-primary" />
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                  Multi-Tenant Architecture
                </h3>
              </div>
              <p className="text-sm text-text-muted dark:text-border-light leading-relaxed">
                Multiple organizations can operate independently on a shared
                platform with complete data isolation, custom branding, and
                individual access controls.
              </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="size-6 text-public-primary" />
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                  Cloud-Native
                </h3>
              </div>
              <p className="text-sm text-text-muted dark:text-border-light leading-relaxed">
                Accessible from anywhere, on any device. Teams in the field,
                the office, or working remotely all stay in sync through a
                single, real-time platform.
              </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="size-6 text-public-primary" />
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                  Enterprise Ready
                </h3>
              </div>
              <p className="text-sm text-text-muted dark:text-border-light leading-relaxed">
                Role-based permissions, audit logs, and robust reporting give
                leadership full visibility while keeping each team member
                focused on their work.
              </p>
            </div>
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
            Join the businesses already using ASAP Platform to streamline their
            operations, close deals faster, and deliver projects on time.
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
