"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "What types of businesses is ASAP built for?",
    answer:
      "ASAP is designed for service-based businesses that manage projects, resources, and inventory — such as event production companies, AV providers, staffing agencies, consulting firms, and rental businesses.",
  },
  {
    question: "How does multi-tenant organization support work?",
    answer:
      "Each organization gets its own isolated workspace with separate data, users, and settings. Users can belong to multiple organizations and switch between them seamlessly.",
  },
  {
    question: "Can I customize fields and workflows?",
    answer:
      "Yes. ASAP supports custom fields, lookup lists, categories, tags, and workflow automation rules that you can configure to match your exact business processes.",
  },
  {
    question: "How does invoicing and payment tracking work?",
    answer:
      "Create quotes, convert them to invoices with one click, record payments, and track outstanding balances. The system automatically updates invoice statuses and calculates aging reports.",
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
