import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/query-client-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import { SidebarErrorBoundary } from "@/components/layout/sidebar-error-boundary";
import { HotkeysProvider } from "@/contexts/hotkeys-context";
import { HotkeyCheatSheet } from "@/components/hotkeys/hotkey-cheat-sheet";
import { UserPreferencesProvider } from "@/contexts/user-preferences-context";
import { PreferencesDialogProvider } from "@/contexts/preferences-dialog-context";
import { UserPreferencesDialogFromContext } from "@/components/preferences/user-preferences-dialog-from-context";

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
  description: "",
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
                      {children}
                      <HotkeyCheatSheet />
                      <UserPreferencesDialogFromContext />

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
