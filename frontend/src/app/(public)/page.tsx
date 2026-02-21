import { Metadata } from "next";
import {
  HeroSection,
  TrustedBySection,
  SolutionsSection,
  PlatformSection,
  DashboardPreviewSection,
  GettingStartedSection,
  NewsSection,
  TestimonialSection,
  FAQSection,
  ResellersSection,
  ContactCTASection,
  NewsletterSection,
} from "@/components/public/sections";

export const metadata: Metadata = {
  title: "ASAP Platform",
  description:
    "ASAP Platform - Comprehensive quality management and monitoring solution.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <SolutionsSection />
      <PlatformSection />
      <DashboardPreviewSection />
      <GettingStartedSection />
      <NewsSection />
      <TestimonialSection />
      <FAQSection />
      <ResellersSection />
      <ContactCTASection />
      <NewsletterSection />
    </>
  );
}
