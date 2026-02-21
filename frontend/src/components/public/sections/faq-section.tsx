"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question:
      "How do VaporSafe™ results compare to other approaches, like summa canisters?",
    answer:
      "Analytical results using US EPA Modified Method TO-14A compare well within regulatory tolerances. The system has never produced false positives or negatives across 100+ projects.",
  },
  {
    question: "How long do I need to monitor?",
    answer:
      "Typical engagements last one week or less, averaging three to five days depending on objectives and barometric pressure considerations.",
  },
  {
    question:
      "Has the VaporSafe™ system been used or approved by regulatory agencies?",
    answer:
      "Yes, accepted at multiple US EPA Superfund sites across multiple regions and states, plus US Navy, Army Corps of Engineers, and international agencies.",
  },
  {
    question: "Do you compete with Environmental Consultants and Engineers?",
    answer:
      "No. Consultants are customers who commonly rent VaporSafe™ for projects, treating the company as a partner.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-16 px-4 bg-background-light dark:bg-background-dark">
      <div className="max-w-[768px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-black text-foreground-dark dark:text-foreground-light uppercase">
            Frequently Asked Questions
          </h2>
          <Link
            href="/faqs"
            className="text-public-primary font-bold text-sm hover:underline"
          >
            View all FAQs
          </Link>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-text-muted rounded-lg overflow-hidden"
            >
              <button
                className="w-full p-4 text-left font-bold text-foreground-dark dark:text-foreground-light flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.question}
                <ChevronDown
                  className={`size-5 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4">
                  <p className="text-text-muted dark:text-border-light text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
