"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateAccountDialog } from "./create-account-dialog";
import { EditAccountDialog } from "./edit-account-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { AccountsTable } from "./accounts-table";
import { accountsApi } from "@/lib/api-client";
import type { Account } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus } from "lucide-react";
import { useHotkeyScope, useHotkey } from "@/hooks/use-hotkey";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

type SortField = "name" | "createdAt";
type SortOrder = "asc" | "desc";

export function AccountsContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  // Query accounts to get the list for navigation
  const { data: accountsData } = useQuery({
    queryKey: [
      QUERY_KEYS.ADMIN_ACCOUNTS,
      page,
      pageSize,
      sortField,
      sortOrder,
      debouncedSearchQuery,
    ],
    queryFn: () =>
      accountsApi.getAllAccounts({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        query: debouncedSearchQuery || undefined,
      }),
  });

  const accounts = useMemo(
    () => accountsData?.items || [],
    [accountsData?.items]
  );

  // Activate accounts hotkey scope
  useHotkeyScope("accounts");

  // Handle edit selected account
  const handleEditSelected = useCallback(() => {
    if (
      accounts.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < accounts.length
    ) {
      setEditingAccount(accounts[selectedIndex]);
    }
  }, [accounts, selectedIndex]);

  // Handle delete selected account
  const handleDeleteSelected = useCallback(() => {
    if (
      accounts.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < accounts.length
    ) {
      setDeletingAccount(accounts[selectedIndex]);
    }
  }, [accounts, selectedIndex]);

  // Register page-specific hotkeys
  useHotkey("accounts.new-account", () => setCreateDialogOpen(true), {}, []);
  useHotkey(
    "accounts.refresh",
    () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS] }),
    {},
    [queryClient]
  );
  useHotkey(
    "accounts.navigate-down",
    () => {
      if (accounts.length > 0) {
        setSelectedIndex((prev) => Math.min(prev + 1, accounts.length - 1));
      }
    },
    {},
    [accounts.length]
  );
  useHotkey(
    "accounts.navigate-up",
    () => {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    },
    {},
    []
  );
  useHotkey("accounts.edit-selected", handleEditSelected, {}, [
    handleEditSelected,
  ]);
  useHotkey("accounts.delete-selected", handleDeleteSelected, {}, [
    handleDeleteSelected,
  ]);

  // Debounce search query (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 0 when search changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Organization Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all organizations in the system
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search accounts by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <AccountsTable
        searchQuery={debouncedSearchQuery}
        page={page}
        pageSize={pageSize}
        sortField={sortField}
        sortOrder={sortOrder}
        selectedIndex={selectedIndex}
        onSort={handleSort}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSelectedIndexChange={setSelectedIndex}
      />

      <CreateAccountDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onAccountCreated={() => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS],
          });
        }}
      />

      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          onAccountUpdated={() => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS],
            });
            setEditingAccount(null);
          }}
        />
      )}

      {deletingAccount && (
        <DeleteAccountDialog
          account={deletingAccount}
          open={!!deletingAccount}
          onOpenChange={(open) => !open && setDeletingAccount(null)}
          onAccountDeleted={() => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS],
            });
            setDeletingAccount(null);
          }}
        />
      )}
    </div>
  );
}
