import { Metadata } from "next";
import { Users, Globe, Mail, Phone, ExternalLink } from "lucide-react";

import Image from "next/image";

export const metadata: Metadata = {
  title: "About - VaporSafe",
  description:
    "VaporSafe® is a partnership between Hartman Environmental Geoscience and Groundswell Technologies, with over 30 years of vapor intrusion expertise.",
};

const teamMembers = [
  {
    name: "Dr. Mark Kram",
    title: "Founder and CTO, Groundswell Technologies",
    description:
      "PhD in Environmental Science (UCSB). Over 30 years developing environmental assessment techniques. Internationally recognized expert in site characterization and sensor development.",
    image: "/team/mark-kram.png",
  },
  {
    name: "Kristof Van Vooren",
    title: "CEO, Group Van Vooren (Europe)",
    description:
      "Environmental industry experience since 1993. Bachelor's in Business Administration, MBA in International Business.",
    image: "/team/kristof-van-vooren.jpg",
  },
  {
    name: "Clint Hartman",
    title: "Chemist, Hartman Environmental Geoscience",
    description:
      "Primary onsite chemist with advanced knowledge of VaporSafe equipment. Handles technology support and digital media content.",
    image: "/team/clint-hartman.jpg",
  },
  {
    name: "Tom Wuyts",
    title: "Team Manager, Terra Engineering (Group Van Vooren)",
    description:
      "Master's in Chemistry cum laude from University of Antwerp. Expert in ex-situ and in-situ remediation projects.",
    image: "/team/tom-wuyts.jpg",
  },
  {
    name: "Dr. Paulo Negrão",
    title: "CEO, Clean Environment Brasil",
    description:
      "PhD in Geosciences from UNICAMP. Leads VaporSafe operations in Brazil since 2019. University instructor and Princeton Groundwater course instructor.",
    image: "/team/paulo-negrao.jpg",
  },
  {
    name: "Dr. Blayne Hartman",
    title: "CEO, Hartman Environmental Geoscience",
    description:
      "Over 30 years of soil gas experience and 20 years of vapor intrusion experience. Nationally recognized expert and contributor to EPA and state guidance documents.",
    image: "/team/blayne-hartman.png",
  },
  {
    name: "Dane Egelton",
    title: "Principal Environmental Scientist, CSI Australia",
    description:
      "15 years in contaminated land investigation. Certified Environmental Practitioner and Site Contamination Specialist.",
    image: "/team/dane-egelton.jpg",
  },
  {
    name: "Casey Brownell",
    title: "Architect, Hartman Environmental Geoscience",
    description:
      "Master's in Architecture from Northeastern University. Focus on design, sustainability, and business development. Licensed architect in Massachusetts.",
    image: "/team/casey-brownell.jpg",
  },
];

const resellers = [
  {
    region: "Australia",
    company: "Contaminated Site Investigations (CSI)",
    contact: "Dane Egelton",
    email: "dane@csiaus.com.au",
    phone: "+(61) 499-859-528",
    website: "https://csiaus.com.au",
    logo: "/resellers/csi-australia.png",
  },
  {
    region: "Europe",
    company: "Group Van Vooren",
    contact: null,
    email: "info@groupvanvooren.com",
    phone: "+(32) 9 342 81 18",
    website: "https://groupvanvooren.com",
    logo: "/resellers/group-van-vooren.jpg",
  },
  {
    region: "Latin America",
    company: "Clean Environment Brasil",
    contact: null,
    email: "contato@clean.com.br",
    phone: "+(19) 3794-2900",
    website: "https://clean.com.br",
    logo: "/resellers/clean-brasil.png",
  },
];

const publications = [
  "Kram, M.L., Hartman, B., Frescura, C., et al. (2020). Remediation Magazine",
  "Kram, M.L., Hartman, B., et al. (2018). Remediation Magazine",
  "Kram, M.L., Hartman, B., et al. (2017). Remediation Magazine",
  "Kram, M.L., Hartman, B., et al. (2016). Remediation Magazine",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-[960px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
            About VaporSafe
          </h1>
          <p className="text-lg text-text-muted dark:text-border-light max-w-3xl mx-auto">
            VaporSafe® is a partnership between Hartman Environmental Geoscience
            and Groundswell Technologies, combining over 30 years of vapor
            intrusion expertise with cutting-edge automated monitoring
            technology.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 px-4">
        <div className="max-w-[960px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
                Our Expertise
              </h2>
              <div className="space-y-4 text-text-muted dark:text-border-light">
                <p>
                  We are world leaders in real-time chemical emissions and odor
                  monitoring, providing Data as a Service (DaaS) solutions for
                  environmental consultants, regulators, and operators.
                </p>
                <p>
                  Our team has published significant research in peer-reviewed
                  journals, including multiple publications in{" "}
                  <em>Remediation</em> magazine focusing on automated continuous
                  monitoring methods for detecting toxic subsurface vapors.
                </p>
                <p>
                  VaporSafe® technology is accepted at multiple US EPA Superfund
                  sites, US Navy installations, Army Corps of Engineers
                  projects, and international agencies.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-6">
                Publications
              </h2>
              <ul className="space-y-3">
                {publications.map((pub, index) => (
                  <li
                    key={index}
                    className="text-sm text-text-muted dark:text-border-light bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark"
                  >
                    {pub}
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
                <div className="size-20 rounded-full overflow-hidden mb-4 border-2 border-border-light dark:border-border-dark">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
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

      {/* Resellers Section */}
      <section id="resellers" className="py-16 px-4">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-public-secondary/10 rounded-lg text-public-secondary">
              <Globe className="size-8" />
            </div>
            <h2 className="text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
              International Resellers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {resellers.map((reseller) => (
              <div
                key={reseller.region}
                className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6"
              >
                <div className="h-12 mb-4 flex items-center">
                  <Image
                    src={reseller.logo}
                    alt={reseller.company}
                    width={120}
                    height={48}
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <span className="inline-block text-xs font-bold text-public-primary uppercase tracking-wider mb-2">
                  {reseller.region}
                </span>
                <h3 className="font-bold text-foreground-dark dark:text-foreground-light mb-1">
                  {reseller.company}
                </h3>
                {reseller.contact && (
                  <p className="text-sm text-text-muted mb-2">
                    {reseller.contact}
                  </p>
                )}

                <div className="space-y-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                  <a
                    href={`mailto:${reseller.email}`}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-public-primary transition-colors"
                  >
                    <Mail className="size-4" />
                    {reseller.email}
                  </a>
                  <a
                    href={`tel:${reseller.phone}`}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-public-primary transition-colors"
                  >
                    <Phone className="size-4" />
                    {reseller.phone}
                  </a>
                  <a
                    href={reseller.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-public-primary transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    Website
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-public-primary text-white">
        <div className="max-w-[960px] mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
            Work With Us
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Whether you&apos;re an environmental consultant, regulator, or
            operator, we&apos;re here to help solve your monitoring challenges.
          </p>
          <a
            href="mailto:sales@vaporsafe.io?subject=VaporSafe Inquiry"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-public-primary font-bold rounded-lg hover:bg-white/90 transition-colors uppercase"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
