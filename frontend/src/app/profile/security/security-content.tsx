"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Key, Loader2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const passwordSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

interface AuthMethods {
  passwordEnabled: boolean;
  loginLinkEnabled: boolean;
  googleEnabled: boolean;
}

export function SecurityContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authMethods, setAuthMethods] = useState<AuthMethods | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    loadAuthMethods();
  }, []);

  const loadAuthMethods = async () => {
    try {
      const response = await authClient.apiRequest(
        "/api/users/me/auth-methods"
      );
      setAuthMethods(response as AuthMethods);
    } catch (err) {
      console.error("Failed to load auth methods", err);
    }
  };

  const onSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authClient.apiRequest("/api/users/me/password", {
        method: "PUT",
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      setSuccess("Password changed successfully!");
      reset();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to change password. Please check your current password.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-foreground"
              >
                Profile
              </Link>
            </li>
            <li className="text-muted-foreground">/</li>
            <li className="font-medium">Security</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your password and login methods.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md max-w-2xl">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md max-w-2xl">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="Leave empty if you don't have a password"
                  {...register("oldPassword")}
                  disabled={isLoading}
                />
                {errors.oldPassword && (
                  <p className="text-sm text-red-600">
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                  disabled={isLoading}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Login Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Login Methods
            </CardTitle>
            <CardDescription>
              Authentication methods enabled for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authMethods ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Email & Password</span>
                  </div>
                  <Badge
                    variant={
                      authMethods.passwordEnabled ? "default" : "secondary"
                    }
                  >
                    {authMethods.passwordEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <span className="h-4 w-4 mr-2 text-muted-foreground">
                      🔗
                    </span>
                    <span className="text-sm">Magic Links</span>
                  </div>
                  <Badge
                    variant={
                      authMethods.loginLinkEnabled ? "default" : "secondary"
                    }
                  >
                    {authMethods.loginLinkEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <span className="h-4 w-4 mr-2 text-muted-foreground">
                      🔐
                    </span>
                    <span className="text-sm">Google OAuth2</span>
                  </div>
                  <Badge
                    variant={
                      authMethods.googleEnabled ? "default" : "secondary"
                    }
                  >
                    {authMethods.googleEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
