import { Metadata } from "next";
import {
  Building2,
  Leaf,
  Clock,
  BarChart3,
  DollarSign,
  Shield,
  Users,
  Zap,
  Check,
  FlaskConical,
  Gauge,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services - VaporSafe",
  description:
    "VaporSafe® provides real-time vapor intrusion detection and cannabis odor management services with lab-grade analytical measurements.",
};

const highlights = [
  {
    icon: Clock,
    title: "Speed",
    description: "Find vapor intrusions, on average, in less than three days",
  },
  {
    icon: BarChart3,
    title: "Real-time Data",
    description: "Onsite, near real-time lab grade analytical measurements",
  },
  {
    icon: DollarSign,
    title: "Cost Efficiency",
    description: "Reach solutions quickly, reducing overall project timelines",
  },
  {
    icon: Shield,
    title: "Secure Reporting",
    description:
      "Real-time web-based analysis accessible to entire project teams",
  },
];

const vaporIntrusionSolutions = [
  "Determine risk versus non-risk situations",
  "Identify and respond to TCE accelerated or urgent exceedances",
  "Locate indoor sources and VOC entry points",
  "Optimize mitigation and remediation systems",
  "Conduct long-term monitoring of fugitive emissions",
  "Resolve brownfield concerns during escrow",
  "Evaluate large neighborhoods",
  "Address vapor intrusion mysteries",
  "Prevent acute exposures",
];

const analyticalFeatures = [
  "Lab-grade gas chromatograph compliant with US EPA method TO-14A (modified)",
  "Approximately 10-minute measurement cycles operating continuously",
  "Real-time data transmission to web portal",
  "Up to 16 simultaneous data collection points",
  "Discrete sampling mode for investigating hot spots",
  "Measured compounds: TCE, PCE, TCA, DCE, methane, BTEX, and others",
  "Optional differential pressure and weather data collection",
];

const cannabisBenefits = {
  growers: [
    "Lower electricity consumption and reduced filter replacement",
    "Evaluation and design improvements for odor mitigation systems",
    "Documented concentration data supporting permit applications",
    "Less contaminated filter waste and disposal costs",
    "Confirmation that facilities aren't sources of detected odors",
  ],
  regulators: [
    "Odor and solvent concentration data to confirm thresholds are met",
    "Verification that active odor-control systems are functioning",
    "Reduced environmental impact through decreased filter contamination",
  ],
  communities: [
    "Confirmation that odor control systems are in place and working",
    "Transparency regarding local compliance",
    "Independent, science-based monitoring data",
  ],
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-[960px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
            Our Services
          </h1>
          <p className="text-lg text-text-muted dark:text-border-light max-w-2xl mx-auto">
            VaporSafe® offers real-time monitoring solutions with lab-grade
            analytical measurements and decades of combined experience in vapor
            intrusion innovation.
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

      {/* Vapor Intrusion Section */}
      <section
        id="vapor-intrusion"
        className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark"
      >
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-public-primary/10 rounded-lg text-public-primary">
              <Building2 className="size-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
                Vapor Intrusion
              </h2>
              <p className="text-text-muted">
                Data as a Service (DaaS) platform for environmental consultants
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Solutions */}
            <div>
              <h3 className="text-xl font-bold text-foreground-dark dark:text-foreground-light mb-4">
                What We Solve
              </h3>
              <ul className="space-y-3">
                {vaporIntrusionSolutions.map((solution) => (
                  <li key={solution} className="flex items-start gap-3">
                    <Check className="size-5 text-public-primary flex-shrink-0 mt-0.5" />
                    <span className="text-text-muted dark:text-border-light">
                      {solution}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Analytical System */}
            <div>
              <h3 className="text-xl font-bold text-foreground-dark dark:text-foreground-light mb-4">
                Analytical System
              </h3>
              <ul className="space-y-3">
                {analyticalFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <FlaskConical className="size-5 text-public-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-text-muted dark:text-border-light">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cannabis Odor Management Section */}
      <section
        id="cannabis-odor"
        className="py-16 px-4 bg-background-light dark:bg-background-dark"
      >
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-public-secondary/10 rounded-lg text-public-secondary">
              <Leaf className="size-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
                Cannabis Odor Management
              </h2>
              <p className="text-text-muted">
                Continuous monitoring and automated odor-control activation
              </p>
            </div>
          </div>

          <p className="text-lg text-text-muted dark:text-border-light mb-10 max-w-3xl">
            VaporSafe® continuously monitors cannabis vapor levels and can
            activate existing odor-control systems when levels exceed a
            pre-selected value—reducing operational costs through optimized
            system usage rather than continuous operation.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Growers */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="size-6 text-public-primary" />
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                  For Growers
                </h3>
              </div>
              <ul className="space-y-3">
                {cannabisBenefits.growers.map((benefit) => (
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

            {/* For Regulators */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gauge className="size-6 text-public-primary" />
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                  For Regulators
                </h3>
              </div>
              <ul className="space-y-3">
                {cannabisBenefits.regulators.map((benefit) => (
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

            {/* For Communities */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="size-6 text-public-primary" />
                <h3 className="text-lg font-bold text-foreground-dark dark:text-foreground-light">
                  For Communities
                </h3>
              </div>
              <ul className="space-y-3">
                {cannabisBenefits.communities.map((benefit) => (
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
            Contact us for a technical overview and learn how VaporSafe® can
            solve your monitoring challenges.
          </p>
          <a
            href="mailto:sales@vaporsafe.io?subject=Technical Overview Request"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-public-primary font-bold rounded-lg hover:bg-white/90 transition-colors uppercase"
          >
            Request a Technical Overview
          </a>
        </div>
      </section>
    </div>
  );
}
