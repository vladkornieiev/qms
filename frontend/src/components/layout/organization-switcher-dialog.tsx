"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { authClient, type AvailableOrganization } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";

interface OrganizationSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationSwitcherDialog({
  open,
  onOpenChange,
}: OrganizationSwitcherDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loadUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<AvailableOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current organization ID from user's token
  const currentOrgId = user?.id
    ? authClient.getOrganizationIdFromToken(authClient.getAccessToken() || "")
    : null;

  const loadOrganizations = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = searchTerm
        ? `/api/organizations/available?name=${encodeURIComponent(
            searchTerm
          )}&size=100`
        : "/api/organizations/available?size=100";

      const response = await authClient.apiRequest<{
        items: AvailableOrganization[];
      }>(url);
      setOrganizations(response.items || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load available organizations"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setSearchQuery("");
      setSelectedOrgId(null);
      setError(null);
      setIsSwitching(false);
    }
  }, [open]);

  // Debounced search effect
  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      loadOrganizations(searchQuery || undefined);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, open, loadOrganizations]);

  const filteredOrganizations = organizations;

  const handleOrgClick = (orgId: string) => {
    // Don't allow selecting current organization
    if (orgId === currentOrgId) return;
    setSelectedOrgId(orgId);
  };

  const handleContinue = async () => {
    if (!selectedOrgId) return;

    setIsSwitching(true);
    setError(null);

    try {
      // Switch organization on backend and get new tokens
      await authClient.switchOrganization(selectedOrgId);

      // Reload user data with new organization context
      await loadUser();

      // Invalidate ALL React Query cache to remove old organization data
      queryClient.clear();

      // Close dialog
      onOpenChange(false);

      // Redirect to home to ensure clean state
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch organization");
      setIsSwitching(false);
    }
  };

  const handleClose = () => {
    // Don't allow closing while switching
    if (!isSwitching) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Switch Organization
          </DialogTitle>
          <DialogDescription>
            Select which organization you want to switch to. You can access multiple
            organizations with the same login.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isLoading || isSwitching}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Loading organizations...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-300 mb-3" />
              <p className="text-gray-600">{error}</p>
              <Button
                onClick={() => loadOrganizations()}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-2 pr-2 max-h-[262px]">
              {filteredOrganizations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-600">No organizations found</p>
                </div>
              ) : (
                filteredOrganizations.map((org) => {
                  const isCurrent = org.id === currentOrgId;

                  return (
                    <button
                      key={org.id}
                      onClick={() => handleOrgClick(org.id)}
                      disabled={isCurrent || isSwitching}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isCurrent
                          ? "border-green-200 bg-green-50 cursor-default"
                          : selectedOrgId === org.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${isSwitching ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {org.name}
                            </h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                Organization
                              </Badge>
                              {isCurrent && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-green-100 text-green-800"
                                >
                                  Current
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedOrgId === org.id && !isCurrent && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSwitching}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedOrgId || isSwitching}
            className="flex-1"
          >
            {isSwitching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                Switch Organization
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
