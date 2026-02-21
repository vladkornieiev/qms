import { FileText, FlaskConical, Factory } from "lucide-react";
import Link from "next/link";

const articles = [
  {
    category: "Case Study",
    title:
      "VaporSafe Helps Negotiate Settlement Between City of Goleta and Cannabis Cultivator",
    description:
      "How real-time odor monitoring data facilitated a successful resolution between the City and a cannabis facility.",
    icon: Factory,
  },
  {
    category: "Industry News",
    title: "Historic Cannabis Odor Agreement Signed",
    description:
      "A landmark agreement using VaporSafe® data sets new standards for cannabis odor compliance.",
    icon: FileText,
  },
  {
    category: "Regulatory Update",
    title: "CA Supplemental VI Guide",
    description:
      "California's updated vapor intrusion guidance and how VaporSafe® supports compliance requirements.",
    icon: FlaskConical,
  },
];

export function NewsSection() {
  return (
    <section className="w-full py-16 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-[960px] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-foreground-dark dark:text-foreground-light uppercase">
            Latest News
          </h2>
          <Link
            href="/news"
            className="text-public-primary font-bold text-sm hover:underline"
          >
            View all articles
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.title}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <div className="aspect-video bg-border-light dark:bg-surface-dark rounded-lg w-full overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  <article.icon className="size-10" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-public-primary uppercase">
                  {article.category}
                </span>
                <h3 className="font-bold text-foreground-dark dark:text-foreground-light group-hover:text-public-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-text-muted line-clamp-2">
                  {article.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
