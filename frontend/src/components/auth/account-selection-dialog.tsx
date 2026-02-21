"use client";

import React, { useState } from "react";
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
import { Building2, Search, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import type { AvailableOrganization } from "@/lib/auth-client";

interface AccountSelectionDialogProps {
  open: boolean;
  accounts: AvailableOrganization[];
  onSelectAccount: (accountId: string) => void;
  onCancel: () => void;
  isAuthenticating?: boolean;
}

export function AccountSelectionDialog({
  open,
  accounts,
  onSelectAccount,
  onCancel,
  isAuthenticating = false,
}: AccountSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleContinue = () => {
    if (selectedAccountId) {
      onSelectAccount(selectedAccountId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Organization
          </DialogTitle>
          <DialogDescription>
            You have access to multiple organizations. Please select which organization
            you want to sign in to.
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
              disabled={isAuthenticating}
            />
          </div>

          <div className="overflow-y-auto space-y-2 pr-2 max-h-[262px]">
            {filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600">No organizations found</p>
              </div>
            ) : (
              filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountClick(account.id)}
                  disabled={isAuthenticating}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isAuthenticating
                      ? "opacity-50 cursor-not-allowed"
                      : selectedAccountId === account.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {account.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Organization
                        </Badge>
                      </div>
                    </div>
                    {selectedAccountId === account.id && (
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isAuthenticating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedAccountId || isAuthenticating}
            className="flex-1"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
