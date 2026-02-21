import { Public_Sans } from "next/font/google";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import "./public.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  weight: ["300", "400", "600", "700", "900"],
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${publicSans.variable} font-sans min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-dark dark:text-foreground-light`}
    >
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
