"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do VaporSafe™ results compare to other approaches, like summa canisters?",
    answer:
      "Analytical results using US EPA Modified Method TO-14A compare well within regulatory tolerances. The system has never produced false positives or negatives across 100+ projects.",
  },
  {
    question: "How many VaporSafe™ analyses are possible during every 24-hour period of monitoring?",
    answer: "More than 140 analyses per 24-hour period are possible.",
  },
  {
    question: "How many monitoring locations per site are possible?",
    answer:
      "Up to 16 locations by default, with additional locations available for extra cost.",
  },
  {
    question: "How accurate are the measurements?",
    answer:
      "System accuracy to calibration standards is within 30%. Clients can dedicate one of 16 ports to calibration gases for continuous self-reporting every three hours or less.",
  },
  {
    question: "How far can samples be automatically collected from the analytical system?",
    answer:
      "Sample lines can be deployed up to several hundred meters from the staging area.",
  },
  {
    question: "In addition to chemical compounds, what other parameters can you measure?",
    answer:
      "Real-time differential pressure, indoor barometric pressure, airport meteorological data, local weather conditions, and system controls for fans and canisters. The system integrates with most sensors and APIs.",
  },
  {
    question: "Can VaporSafe™ be used for VI risk assessments?",
    answer:
      "Yes. The system tracks concentration and controlling factors to generate temporally precise time-weighted averages, enabling more defensible risk assessments than passive sampling approaches.",
  },
  {
    question: "Has the VaporSafe™ system been used or approved by regulatory agencies?",
    answer:
      "Yes, accepted at multiple US EPA Superfund sites across multiple regions and states, plus US Navy, Army Corps of Engineers, and international agencies.",
  },
  {
    question: "How much time does VaporSafe™ need to generate a measurement?",
    answer:
      "Approximately ten minutes, or five minutes with an additional system.",
  },
  {
    question: "How long do I need to monitor?",
    answer:
      "Typical engagements last one week or less, averaging three to five days depending on objectives and barometric pressure considerations.",
  },
  {
    question: "What VOCs can be measured?",
    answer:
      "TCE, PCE, 1,1 DCE, cis-1,2 DCE, trans-1,2 DCE, carbon tetrachloride, chloroform, methane, BTEX, and several others.",
  },
  {
    question: "Do you compete with Environmental Consultants and Engineers?",
    answer:
      "No. Consultants are customers who commonly rent VaporSafe™ for projects, treating the company as a partner.",
  },
  {
    question: "How much does the VaporSafe™ service cost?",
    answer:
      "Competitively priced compared to other methods. Twenty-four hours of monitoring costs approximately the same as 10 canister/passive samples but delivers ~140 daily analyses with dynamic controlling factor data versus single data points.",
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
            Find answers to common questions about VaporSafe® technology and services.
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
