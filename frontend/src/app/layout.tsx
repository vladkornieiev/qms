import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/query-client-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { SidebarErrorBoundary } from "@/components/layout/sidebar-error-boundary";
import { AppShell } from "@/components/layout/app-shell";
import { HotkeysProvider } from "@/contexts/hotkeys-context";
import { HotkeyCheatSheet } from "@/components/hotkeys/hotkey-cheat-sheet";
import { UserPreferencesProvider } from "@/contexts/user-preferences-context";
import { PreferencesDialogProvider } from "@/contexts/preferences-dialog-context";
import { UserPreferencesDialogFromContext } from "@/components/preferences/user-preferences-dialog-from-context";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASAP Platform",
  description: "All-in-one business management platform for quotes, projects, invoicing, inventory, and resource scheduling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <HotkeysProvider>
              <UserPreferencesProvider>
                <PreferencesDialogProvider>
                  <SidebarErrorBoundary>
                    <SidebarProvider>
                      <AppShell>{children}</AppShell>
                      <HotkeyCheatSheet />
                      <UserPreferencesDialogFromContext />
                      <Toaster richColors position="top-right" />
                    </SidebarProvider>
                  </SidebarErrorBoundary>
                </PreferencesDialogProvider>
              </UserPreferencesProvider>
            </HotkeysProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
