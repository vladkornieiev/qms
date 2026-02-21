"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { exchangeMagicLink } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const returnUrl = searchParams.get("returnUrl") || "/";

      if (!token) {
        setStatus("error");
        setError("No authentication token provided");
        return;
      }

      try {
        const result = await exchangeMagicLink(token);

        if (result.success) {
          setStatus("success");
          // Redirect after a brief success display
          setTimeout(() => {
            router.push(returnUrl);
          }, 1500);
        } else {
          setStatus("error");
          setError("Authentication failed");
        }
      } catch {
        setStatus("error");
        setError("Authentication failed. The link may be expired or invalid.");
      }
    };

    handleCallback();
  }, [searchParams, exchangeMagicLink, router]);

  return (
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
                  <h3 className="text-lg font-semibold">Welcome back!</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve been successfully signed in. Redirecting...
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
  );
}
