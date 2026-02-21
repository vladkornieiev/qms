"use client";

import { Metadata } from "next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQs - ASAP Platform",
  description:
    "Frequently asked questions about ASAP Platform—a multi-tenant business management platform for quotes, projects, invoicing, inventory, and resource scheduling.",
};

const faqs = [
  {
    question: "What is ASAP Platform?",
    answer:
      "ASAP Platform is a modern, multi-tenant business management platform designed for service-based businesses. It brings together CRM and client management, quoting and invoicing, project management, inventory and asset tracking, resource scheduling, workflow automation, and reporting—all in one connected system.",
  },
  {
    question: "Who is ASAP Platform built for?",
    answer:
      "ASAP Platform is built for service businesses that need to manage clients, quotes, projects, and resources in one place. Common users include event production companies, AV service providers, staffing agencies, consulting firms, and rental businesses. If your business quotes jobs, delivers projects, and invoices clients, ASAP Platform is built for you.",
  },
  {
    question: "How does multi-tenant work?",
    answer:
      "Multi-tenancy means multiple organizations can run on the same platform infrastructure while keeping their data completely separate. Each organization gets its own isolated workspace with its own users, clients, projects, and settings. There is no data bleed between organizations—your data is yours alone.",
  },
  {
    question: "What integrations are available?",
    answer:
      "ASAP Platform supports integrations with common business tools including accounting software, payment processors, calendar systems, and communication platforms. Our Integrations team actively builds and maintains connections to reduce friction and keep data flowing between the tools your team already uses. Contact us for a current list of supported integrations.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Pricing is based on your organization's size and the features you need. We offer tiered plans to match businesses at different stages of growth. All plans include core features like CRM, quoting, invoicing, and project management. Advanced features like workflow automation, custom reporting, and API access are available on higher tiers. Log in or contact us for detailed pricing.",
  },
  {
    question: "Can I customize fields and workflows?",
    answer:
      "Yes. ASAP Platform is built with flexibility in mind. You can add custom fields to clients, projects, quotes, and inventory records to capture data specific to your industry or process. Workflows can be configured to match how your team operates—including custom project statuses, approval steps, and automation triggers.",
  },
  {
    question: "How does resource scheduling work?",
    answer:
      "Resource scheduling gives you a visual calendar to assign staff, equipment, and other resources across jobs and projects. The system checks availability in real time and flags conflicts before they happen. You can assign resources directly from a project view, and utilization reports help you understand how your team's time is being spent.",
  },
  {
    question: "How does quoting and invoicing connect to the rest of the platform?",
    answer:
      "Quotes in ASAP Platform are built from reusable line items and can include labor, materials, equipment, and markup. When a quote is approved, it can be converted directly into a project and an invoice with a single action—no re-keying data. Invoices stay linked to their originating quote and project, giving you full financial visibility in one place.",
  },
  {
    question: "How does inventory and asset tracking work?",
    answer:
      "ASAP Platform tracks your equipment, materials, and assets with real-time availability. When you build a quote or assign resources to a project, the system checks availability so you never accidentally double-book an asset. Check-in and check-out workflows keep your records accurate, and low-stock alerts let you know when it is time to reorder.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. ASAP Platform uses a multi-tenant architecture with strict data isolation between organizations. Access is controlled through role-based permissions, so each user only sees the data they need to do their job. All data is encrypted in transit and at rest, and the platform maintains audit logs of key actions for accountability and compliance.",
  },
  {
    question: "Can multiple team members use the platform at the same time?",
    answer:
      "Absolutely. ASAP Platform is cloud-native and designed for concurrent team use. Multiple users can work across quotes, projects, scheduling, and client records simultaneously. Changes are reflected in real time, so your team always has an up-to-date view of the business regardless of where they are working from.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is straightforward. Log in to your organization's ASAP Platform workspace, or reach out to our team to set up a new account. Our Customer Success team guides new organizations through onboarding to ensure your data is imported, your workflows are configured, and your team is ready to go from day one.",
  },
];

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-16 px-4 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-foreground-dark dark:text-foreground-light uppercase mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-text-muted dark:text-border-light">
            Find answers to common questions about ASAP Platform and how it can
            help your business.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-text-muted rounded-lg overflow-hidden"
            >
              <button
                className="w-full p-5 text-left font-bold text-foreground-dark dark:text-foreground-light flex justify-between items-start gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`size-5 flex-shrink-0 mt-1 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-text-muted dark:text-border-light leading-relaxed">
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
