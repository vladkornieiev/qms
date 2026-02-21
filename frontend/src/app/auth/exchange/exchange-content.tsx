"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSelectionDialog } from "@/components/auth/account-selection-dialog";
import type { AvailableOrganization } from "@/lib/auth-client";

export function ExchangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { exchangeMagicLink } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<
    AvailableOrganization[]
  >([]);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleExchange = async () => {
      const token = searchParams.get("token");
      const returnUrl = searchParams.get("returnUrl") || "/";

      if (!token) {
        setStatus("error");
        setError("No authentication token provided");
        return;
      }

      try {
        const result = await exchangeMagicLink(token);

        if (result.requiresOrganizationSelection && result.availableOrganizations) {
          // User has multiple organizations, show selection dialog
          setPendingToken(token);
          setAvailableAccounts(result.availableOrganizations);
          setShowAccountSelection(true);
          setStatus("loading");
          return;
        }

        if (result.success) {
          setStatus("success");

          // Check if user needs onboarding (no name set)
          if (
            result.user &&
            (!result.user.firstName || result.user.firstName.trim() === "")
          ) {
            setNeedsOnboarding(true);
            setTimeout(() => {
              router.push("/onboarding");
            }, 1500);
          } else {
            // Redirect to dashboard or return URL
            setTimeout(() => {
              router.push(returnUrl);
            }, 1500);
          }
        } else {
          setStatus("error");
          setError("Authentication failed");
        }
      } catch {
        setStatus("error");
        setError("Authentication failed. The link may be expired or invalid.");
      }
    };

    handleExchange();
  }, [searchParams, exchangeMagicLink, router]);

  const handleAccountSelected = async (accountId: string) => {
    if (!pendingToken) return;

    setIsAuthenticating(true);
    setStatus("loading");

    const returnUrl = searchParams.get("returnUrl") || "/";

    try {
      const result = await exchangeMagicLink(pendingToken, accountId);

      if (result.success) {
        setStatus("success");
        setShowAccountSelection(false);
        setIsAuthenticating(false);

        // Check if user needs onboarding (no name set)
        if (
          result.user &&
          (!result.user.firstName || result.user.firstName.trim() === "")
        ) {
          setNeedsOnboarding(true);
          setTimeout(() => {
            router.push("/onboarding");
          }, 1500);
        } else {
          // Redirect to dashboard or return URL
          setTimeout(() => {
            router.push(returnUrl);
          }, 1500);
        }
      } else {
        setIsAuthenticating(false);
        setStatus("error");
        setError("Authentication failed");
      }
    } catch {
      setIsAuthenticating(false);
      setStatus("error");
      setError("Authentication failed. The link may be expired or invalid.");
    }
  };

  const handleAccountSelectionCancel = () => {
    setShowAccountSelection(false);
    setPendingToken(null);
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
                      Please wait while we authenticate your magic link.
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
