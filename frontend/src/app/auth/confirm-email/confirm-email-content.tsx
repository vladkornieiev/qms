"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/utils";

export function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setError("No confirmation token provided");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/confirm-email?token=${token}`
        );

        if (response.ok) {
          setStatus("success");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          setStatus("error");
          setError(
            errorData.message ||
              "Email confirmation failed. The link may be expired or invalid."
          );
        }
      } catch {
        setStatus("error");
        setError("Email confirmation failed. Please try again.");
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Confirming your email...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we verify your email address.
                  </p>
                </div>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold">Email Confirmed!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your email has been successfully confirmed. Redirecting to
                    login...
                  </p>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold">Confirmation Failed</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full"
                  >
                    Go to Login
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
