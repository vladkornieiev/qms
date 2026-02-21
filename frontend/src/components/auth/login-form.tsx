"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient, type AvailableOrganization } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";
import {
  Loader2,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { AccountSelectionDialog } from "./account-selection-dialog";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const LOGIN_MODE_MAGIC_LINK = "magic-link" as const;
const LOGIN_MODE_PASSWORD = "password" as const;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToMagicLink?: () => void;
  onSwitch2FA?: (email: string, password: string) => void;
}

export function LoginForm({ onSuccess, onSwitch2FA }: LoginFormProps = {}) {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loginMode, setLoginMode] = useState<"magic-link" | "password">(
    LOGIN_MODE_PASSWORD
  );
  const [showAccountSelection, setShowAccountSelection] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<
    AvailableOrganization[]
  >([]);
  const [pendingLoginData, setPendingLoginData] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitMagicLink = async (data: EmailForm) => {
    setError(null);
    setIsLoading(true);
    setSuccess(false);

    try {
      await authClient.createLoginLink(data.email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send magic link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordForm) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(data.email, data.password);

      if (result.requiresOrganizationSelection && result.availableOrganizations) {
        // User has multiple organizations, show selection dialog
        setPendingLoginData({ email: data.email, password: data.password });
        setAvailableAccounts(result.availableOrganizations);
        setShowAccountSelection(true);
        setIsLoading(false);
        return;
      }

      if (result.requires2FA) {
        setIsLoading(false);
        onSwitch2FA?.(data.email, data.password);
        return;
      }

      if (result.success) {
        onSuccess?.();
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelected = async (accountId: string) => {
    if (!pendingLoginData) return;

    setIsAuthenticating(true);
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(
        pendingLoginData.email,
        pendingLoginData.password,
        accountId
      );

      if (result.requires2FA) {
        setIsAuthenticating(false);
        setIsLoading(false);
        setShowAccountSelection(false);
        onSwitch2FA?.(pendingLoginData.email, pendingLoginData.password);
        return;
      }

      if (result.success) {
        setPendingLoginData(null);
        setShowAccountSelection(false);
        setIsAuthenticating(false);
        onSuccess?.();
      } else {
        setIsAuthenticating(false);
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setIsAuthenticating(false);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelectionCancel = () => {
    setShowAccountSelection(false);
    setPendingLoginData(null);
    setAvailableAccounts([]);
    setIsAuthenticating(false);
  };

  const handleGoogleLogin = () => {
    globalThis.location.href = authClient.getGoogleOAuthUrl();
  };

  if (success) {
    return (
      <>
        <div className="w-full max-w-md mx-auto mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a magic link to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium mb-2">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your email inbox</li>
                <li>Click the magic link we sent you</li>
                <li>You&apos;ll be automatically signed in</li>
              </ol>
            </div>
            <p className="text-xs text-gray-500 text-center">
              The link will expire in 60 minutes for security reasons.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSuccess(false)}
            >
              Send Another Link
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Welcome to ASAP Platform</CardTitle>
          <CardDescription>
            Sign in with your email or Google account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {/* Login Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMode("password")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                loginMode === "password"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setLoginMode(LOGIN_MODE_MAGIC_LINK)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                loginMode === LOGIN_MODE_MAGIC_LINK
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Magic Link Form */}
          {loginMode === "magic-link" && (
            <form
              onSubmit={handleSubmitEmail(onSubmitMagicLink)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email Address</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="your@email.com"
                  {...registerEmail("email")}
                  disabled={isLoading}
                />
                {emailErrors.email && (
                  <p className="text-sm text-red-600">
                    {emailErrors.email.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  We&apos;ll send you a magic link to sign in instantly
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Password Form */}
          {loginMode === "password" && (
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="password-email">Email Address</Label>
                <Input
                  id="password-email"
                  type="email"
                  placeholder="your@email.com"
                  {...registerPassword("email")}
                  disabled={isLoading}
                />
                {passwordErrors.email && (
                  <p className="text-sm text-red-600">
                    {passwordErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...registerPassword("password")}
                  disabled={isLoading}
                />
                {passwordErrors.password && (
                  <p className="text-sm text-red-600">
                    {passwordErrors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>

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
