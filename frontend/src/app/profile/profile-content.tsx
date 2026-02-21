"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { useTimezoneFormat } from "@/hooks/use-timezone-format";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfileContent() {
  const { user, loadUser } = useAuthStore();
  const { formatDateTime } = useTimezoneFormat();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  if (!user) return null;

  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authClient.apiRequest("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || undefined,
        }),
      });

      await loadUser();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and settings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex justify-center">
            <ProfilePhotoUpload currentPhotoUrl={user.avatarUrl} />
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full">
                  <CardTitle className="text-xl text-center">
                    {displayName}
                  </CardTitle>
                  <CardDescription className="mt-1 text-center truncate">
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge variant="secondary">{user.roles[0] || "Member"}</Badge>
                </div>

                <div className="pt-2">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since
                  </div>
                  <p className="text-sm font-medium">
                    {formatDateTime(user.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/profile/security">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-600">
                      Profile updated successfully!
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...register("firstName")}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...register("lastName")}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Optional"
                      {...register("phone")}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium">Account Created</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(user.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Last Updated</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(user.updatedAt)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">User ID</span>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {user.id}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Roles</span>
                  <div className="mt-1">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="outline" className="mr-1">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
