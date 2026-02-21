"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowRight, Loader2, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const onboardingSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  phone: z
    .string()
    .max(20, "Phone number is too long")
    .optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect if user already has a name set
    if (user.firstName && user.firstName.trim() !== "") {
      router.push("/");
    }
  }, [user, router]);

  const onSubmit = async (data: OnboardingForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.apiRequest("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
        }),
      });

      // Reload user data
      await loadUser();

      // Redirect to home
      router.push("/");
    } catch {
      setError("Failed to save your information. Please try again.");
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to the Platform!</CardTitle>
          <CardDescription className="text-base">
            Let&apos;s set up your profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                {...register("firstName")}
                disabled={isLoading}
                autoFocus
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                {...register("lastName")}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This is how others will see you on the platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register("phone")}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              You can always update this information later in your profile
              settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
