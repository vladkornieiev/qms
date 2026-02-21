import { Metadata } from "next";
import {
  FileText,
  Scale,
  Handshake,
  Gauge,
  Shield,
  Factory,
  Award,
  Leaf,
  Sun,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions - VaporSafe",
  description:
    "Case studies and success stories showcasing VaporSafe® real-time monitoring solutions for vapor intrusion and cannabis odor management.",
};

const CATEGORY_CASE_STUDY = "Case Study";

const solutions = [
  {
    icon: FileText,
    category: "Regulatory",
    title: "CA Supplemental VI Guide",
    description:
      'The California VI guidance update includes a section on continuous monitoring and references peer-reviewed articles by VaporSafe team members, with ground-breaking efforts described under "Barometric Pressure Trends."',
  },
  {
    icon: Scale,
    category: CATEGORY_CASE_STUDY,
    title: "City of Goleta Cannabis Settlement",
    description:
      "VaporSafe assisted in negotiating a settlement between the City of Goleta and Hidden Trails, LLC. The agreement requires a robust odor response complaint and remediation process and hydrogen sulfide (H2S) monitoring system for a 17.23-acre outdoor cannabis operation.",
  },
  {
    icon: Handshake,
    category: "Industry News",
    title: "Historic Cannabis Odor Agreement",
    description:
      "A memorandum of understanding was signed between CARP Growers and the Santa Barbara Coalition for Responsible Cannabis, aiming for growers and neighbors to collaborate on reducing odors from cannabis facilities.",
  },
  {
    icon: Gauge,
    category: CATEGORY_CASE_STUDY,
    title: "Odor Mitigation System Optimization",
    description:
      "VaporSafe evaluated aerosol neutralization systems and scrubber designs for cannabis growers, then optimized energy efficiency through continuous monitoring and automated mitigation deployment.",
  },
  {
    icon: Shield,
    category: "Government",
    title: "US Navy Continuous Monitoring Fact Sheet",
    description:
      "The US Navy released a fact sheet highlighting VaporSafe's capabilities for continuous vapor intrusion monitoring, with focus on analytical equipment and data applications.",
  },
  {
    icon: Factory,
    category: CATEGORY_CASE_STUDY,
    title: "Cannabis Production Safety Monitoring",
    description:
      "VaporSafe deployed customized systems tracking odor chemicals and fugitive emissions (butane, propane) at a cannabis production facility, addressing both odor and safety concerns.",
  },
  {
    icon: Award,
    category: "Success Story",
    title: "Grower Approval Success",
    description:
      "VaporSafe demonstrated compliance for an accused grower through simultaneous monitoring of odor chemicals alongside wind data, proving emissions dissipated before reaching neighbors.",
  },
  {
    icon: Sun,
    category: "Sustainability",
    title: "Green Monitoring Initiative",
    description:
      "Solar panels power monitoring systems at job sites, reducing environmental impact while maintaining continuous real-time data collection capabilities.",
  },
  {
    icon: Leaf,
    category: CATEGORY_CASE_STUDY,
    title: "Carpinteria Cannabis Solutions",
    description:
      "VaporSafe collaborated with local cannabis growers monitoring odorous vapors causing community complaints, providing data-driven solutions for compliance.",
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
            Real-world examples of how VaporSafe® technology is solving vapor
            intrusion and odor management challenges across industries.
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
            Have a Similar Challenge?
          </h2>
          <p className="text-text-muted dark:text-border-light mb-8 max-w-xl mx-auto">
            Let us show you how VaporSafe® can provide real-time data solutions
            for your specific monitoring needs.
          </p>
          <a
            href="mailto:sales@vaporsafe.io?subject=Quote Request"
            className="inline-flex items-center justify-center px-8 py-3 bg-public-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors uppercase"
          >
            Get a Quote
          </a>
        </div>
      </section>
    </div>
  );
}
