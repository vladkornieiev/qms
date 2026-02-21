"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserDialog } from "./create-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UsersTable } from "./users-table";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { accountsApi, usersApi } from "@/lib/api-client";
import type { UserWithAccount } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Plus, Filter } from "lucide-react";
import { useHotkeyScope, useHotkey } from "@/hooks/use-hotkey";

type SortField = "name" | "email" | "createdAt";
type SortOrder = "asc" | "desc";

const ADMIN_USERS_QUERY_KEY = "admin-users";

export function UsersContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingUser, setEditingUser] = useState<UserWithAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithAccount | null>(
    null
  );

  // Query users to get the list for navigation
  const { data: usersData } = useQuery({
    queryKey: [
      ADMIN_USERS_QUERY_KEY,
      page,
      pageSize,
      sortField,
      sortOrder,
      debouncedSearchQuery,
      accountFilter,
    ],
    queryFn: () =>
      usersApi.getAllUsers({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        ...(debouncedSearchQuery && { query: debouncedSearchQuery }),
        ...(accountFilter !== "all" && { accountId: accountFilter }),
      }),
  });

  const users = useMemo(() => usersData?.items || [], [usersData?.items]);

  // Activate admin-users hotkey scope
  useHotkeyScope(ADMIN_USERS_QUERY_KEY);

  // Handle edit selected user
  const handleEditSelected = useCallback(() => {
    if (
      users.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < users.length
    ) {
      setEditingUser(users[selectedIndex]);
    }
  }, [users, selectedIndex]);

  // Handle delete selected user
  const handleDeleteSelected = useCallback(() => {
    if (
      users.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < users.length
    ) {
      setDeletingUser(users[selectedIndex]);
    }
  }, [users, selectedIndex]);

  // Register page-specific hotkeys
  useHotkey(`${ADMIN_USERS_QUERY_KEY}.new-user`, () => setCreateDialogOpen(true), {}, []);
  useHotkey(
    `${ADMIN_USERS_QUERY_KEY}.refresh`,
    () => queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] }),
    {},
    [queryClient]
  );
  useHotkey(
    `${ADMIN_USERS_QUERY_KEY}.navigate-down`,
    () => {
      if (users.length > 0) {
        setSelectedIndex((prev) => Math.min(prev + 1, users.length - 1));
      }
    },
    {},
    [users.length]
  );
  useHotkey(
    `${ADMIN_USERS_QUERY_KEY}.navigate-up`,
    () => {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    },
    {},
    []
  );
  useHotkey(`${ADMIN_USERS_QUERY_KEY}.edit-selected`, handleEditSelected, {}, [
    handleEditSelected,
  ]);
  useHotkey(`${ADMIN_USERS_QUERY_KEY}.delete-selected`, handleDeleteSelected, {}, [
    handleDeleteSelected,
  ]);

  // Debounce search query (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery, accountFilter]);

  const { data: accountsData } = useQuery({
    queryKey: ["admin-all-accounts"],
    queryFn: () => accountsApi.getAllAccounts({ size: 100 }),
  });

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
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage users across all organizations</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {accountsData?.items?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <UsersTable
        searchQuery={debouncedSearchQuery}
        accountFilter={accountFilter}
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

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUserCreated={() => {
          queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
        }}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={() => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
            setEditingUser(null);
          }}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          onUserDeleted={() => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
            setDeletingUser(null);
          }}
        />
      )}
    </div>
  );
}
