"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate?: (photoUrl: string) => void;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUpdate,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loadUser } = useAuthStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Upload file to attachments endpoint
      const formData = new FormData();
      formData.append("attachment", selectedFile);
      formData.append("name", `profile-photo-${user?.id}`);
      formData.append("type", "profile_picture");

      const attachment = await authClient.apiRequest<{
        id: string;
        url?: string;
      }>("/api/attachments", {
        method: "POST",
        body: formData,
      });

      // Update user profile with new picture ID
      await authClient.apiRequest("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          pictureId: attachment.id,
        }),
      });

      // Refresh user data
      await loadUser();

      // Clear preview and selected file
      setPreviewUrl(null);
      setSelectedFile(null);

      // Notify parent component
      if (onPhotoUpdate && attachment.url) {
        onPhotoUpdate(attachment.url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to update profile photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Photo Display */}
          <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden bg-gray-100">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="Profile photo"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
            )}

            {/* Upload overlay for existing photo */}
            {!previewUrl && (
              <button
                onClick={triggerFileSelect}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center group"
              >
                <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          {previewUrl ? (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save Photo
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={triggerFileSelect}
              variant="outline"
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              {currentPhotoUrl ? "Change Photo" : "Add Photo"}
            </Button>
          )}

          {/* File Info */}
          {selectedFile && (
            <div className="text-sm text-gray-600 text-center">
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
