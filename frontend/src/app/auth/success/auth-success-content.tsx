"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSelectionDialog } from "@/components/auth/account-selection-dialog";
import { authClient, type AvailableOrganization } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";

export function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { loadUser } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<
    AvailableOrganization[]
  >([]);
  const [pendingTokens, setPendingTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleSuccess = async () => {
      const code = searchParams.get("code");
      const refreshToken = searchParams.get("refreshToken");
      const accessToken = searchParams.get("accessToken");
      const isMultiAccountUser =
        searchParams.get("isMultiAccountUser") === "true" ||
        searchParams.get("isMultiOrgUser") === "true";
      const returnUrl = searchParams.get("returnUrl") || "/";

      try {
        let tokens: { accessToken: string; refreshToken: string };

        if (code) {
          // New flow: exchange short-lived code for tokens
          const authResponse = await authClient.exchangeOAuthCode(code);
          tokens = {
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
          };
        } else if (accessToken && refreshToken) {
          // Legacy flow: tokens passed directly in URL
          authClient.setTokens({ accessToken, refreshToken });
          tokens = { accessToken, refreshToken };
        } else {
          setStatus("error");
          setError("No authentication tokens provided");
          return;
        }

        // If user has multiple accounts, we need to show account selection
        if (isMultiAccountUser) {
          // Fetch available organizations using the tokens
          const accounts = await authClient.getAvailableOrganizations();
          setPendingTokens(tokens);
          setAvailableAccounts(accounts);
          setShowAccountSelection(true);
          setStatus("loading");
          return;
        }

        // Load user data
        await loadUser();
        // Get user from store after loading
        const currentUser = useAuthStore.getState().user;

        setStatus("success");

        // Check if user needs onboarding (no name set)
        if (
          currentUser &&
          (!currentUser.firstName || currentUser.firstName.trim() === "")
        ) {
          setNeedsOnboarding(true);
          setTimeout(() => {
            router.push("/onboarding");
          }, 1500);
        } else {
          // Redirect to home or return URL
          setTimeout(() => {
            router.push(returnUrl);
          }, 1500);
        }
      } catch (err) {
        console.error("Google OAuth success handling failed:", err);
        setStatus("error");
        setError(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please try again."
        );
      }
    };

    handleSuccess();
  }, [searchParams, router, loadUser]);

  const handleAccountSelected = async (accountId: string) => {
    if (!pendingTokens) return;

    setIsAuthenticating(true);
    setStatus("loading");

    const returnUrl = searchParams.get("returnUrl") || "/";

    try {
      // Ensure tokens are set (they should be, but just in case)
      authClient.setTokens({
        accessToken: pendingTokens.accessToken,
        refreshToken: pendingTokens.refreshToken,
      });

      // Switch to the selected organization - this will get new tokens for that organization
      await authClient.switchOrganization(accountId);

      // Reload user data with new organization context
      await loadUser();

      // Invalidate ALL React Query cache to remove old organization data
      queryClient.clear();

      setStatus("success");
      setShowAccountSelection(false);
      setIsAuthenticating(false);
      setPendingTokens(null);

      // Get user from store after loading
      const currentUser = useAuthStore.getState().user;

      // Check if user needs onboarding (no name set)
      if (
        currentUser &&
        (!currentUser.firstName || currentUser.firstName.trim() === "")
      ) {
        setNeedsOnboarding(true);
        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
      } else {
        // Redirect to home or return URL
        setTimeout(() => {
          router.push(returnUrl);
        }, 1500);
      }
    } catch (err) {
      console.error("Organization selection failed:", err);
      setIsAuthenticating(false);
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to switch organization. Please try again."
      );
    }
  };

  const handleAccountSelectionCancel = () => {
    // Clear temporary tokens
    if (pendingTokens) {
      authClient.clearTokens();
    }
    setShowAccountSelection(false);
    setPendingTokens(null);
    setAvailableAccounts([]);
    setIsAuthenticating(false);
    setStatus("error");
    setError("Organization selection cancelled");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {status === "loading" && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Signing you in...</h3>
                    <p className="text-sm text-muted-foreground">
                      {showAccountSelection
                        ? "Please select an organization to continue."
                        : "Please wait while we authenticate your session."}
                    </p>
                  </div>
                </>
              )}

              {status === "success" && (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Welcome!</h3>
                    <p className="text-sm text-muted-foreground">
                      {needsOnboarding
                        ? "Let's set up your profile..."
                        : "You've been successfully signed in. Redirecting..."}
                    </p>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <XCircle className="h-12 w-12 mx-auto text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Authentication Failed
                    </h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => router.push("/")}
                      variant="outline"
                      className="w-full"
                    >
                      Go Home
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AccountSelectionDialog
        open={showAccountSelection}
        accounts={availableAccounts}
        onSelectAccount={handleAccountSelected}
        onCancel={handleAccountSelectionCancel}
        isAuthenticating={isAuthenticating}
      />
    </>
  );
}
