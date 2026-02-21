"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CreateUserDialog } from "./components/create-user-dialog";
import { EditUserDialog } from "./components/edit-user-dialog";
import { UsersListTable } from "./components/users-list-table";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api-client";
import type { User } from "@/lib/auth-client";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, AlertCircle, Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { canManageUsers } from "@/lib/permissions";
import { useHotkeyScope, useHotkey } from "@/hooks/use-hotkey";

export default function UsersPage() {
  const { user } = useAuthStore();
  const canManage = canManageUsers(user);

  if (!canManage) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-8 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Access Denied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You don&apos;t have permission to manage users.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-8 py-8">
          <UsersContent />
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </ProtectedRoute>
  );
}

type SortField = "name" | "email" | "createdAt";
type SortOrder = "asc" | "desc";

function UsersContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Query users to get the list for navigation
  const { data: usersData } = useQuery({
    queryKey: [
      "users",
      page,
      pageSize,
      sortField,
      sortOrder,
      debouncedSearchQuery,
    ],
    queryFn: () =>
      usersApi.getUsers({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        ...(debouncedSearchQuery && { query: debouncedSearchQuery }),
      }),
  });

  const users = useMemo(() => usersData?.items || [], [usersData?.items]);

  // Activate users hotkey scope
  useHotkeyScope("users");

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
  useHotkey("users.new-user", () => setCreateDialogOpen(true), {}, []);
  useHotkey(
    "users.refresh",
    () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    {},
    [queryClient]
  );
  useHotkey(
    "users.navigate-down",
    () => {
      if (users.length > 0) {
        setSelectedIndex((prev) => Math.min(prev + 1, users.length - 1));
      }
    },
    {},
    [users.length]
  );
  useHotkey(
    "users.navigate-up",
    () => {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    },
    {},
    []
  );
  useHotkey("users.edit-selected", handleEditSelected, {}, [
    handleEditSelected,
  ]);
  useHotkey("users.delete-selected", handleDeleteSelected, {}, [
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
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage users in your organization</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Search */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <UsersListTable
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

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUserCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
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
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setDeletingUser(null);
          }}
        />
      )}
    </div>
  );
}
