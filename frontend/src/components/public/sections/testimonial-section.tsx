"use client";

import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "ASAP replaced five different tools we were juggling. Now our entire workflow — from quote to payment — lives in one place.",
    author: "Operations Manager",
    role: "Event Production Agency",
  },
  {
    quote:
      "The resource scheduling alone saved us hours every week. We can see who's available, book them, and track payouts without any spreadsheets.",
    author: "Project Lead",
    role: "AV Services Company",
  },
  {
    quote:
      "Our invoicing used to take days. Now we convert quotes to invoices in one click and get paid faster.",
    author: "Business Owner",
    role: "Technical Services Firm",
  },
];

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="w-full py-16 px-4 bg-surface-light dark:bg-surface-dark border-y border-border-light dark:border-border-dark">
      <div className="max-w-[800px] mx-auto text-center">
        <Quote className="size-10 text-public-primary mx-auto mb-6" />
        <blockquote className="text-xl md:text-2xl font-medium text-surface-dark dark:text-border-light leading-relaxed italic mb-8 min-h-[100px]">
          &ldquo;{current.quote}&rdquo;
        </blockquote>
        <div className="flex flex-col items-center mb-6">
          <span className="font-bold text-foreground-dark dark:text-foreground-light">
            {current.author}
          </span>
          <span className="text-sm text-text-muted">{current.role}</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="p-2 rounded-full border border-border-light dark:border-border-dark hover:border-public-primary hover:text-public-primary transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`size-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-public-primary"
                    : "bg-border-light dark:bg-border-dark"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="p-2 rounded-full border border-border-light dark:border-border-dark hover:border-public-primary hover:text-public-primary transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
