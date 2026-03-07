"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";
import { OrganizationsTable } from "./organizations-table";
import { organizationsApi } from "@/lib/api-client";
import type { Organization } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus } from "lucide-react";
import { useHotkeyScope, useHotkey } from "@/hooks/use-hotkey";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

type SortField = "name" | "createdAt";
type SortOrder = "asc" | "desc";

export function OrganizationsContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [deletingOrganization, setDeletingOrganization] = useState<Organization | null>(null);

  const { data: organizationsData } = useQuery({
    queryKey: [
      QUERY_KEYS.ADMIN_ORGANIZATIONS,
      page,
      pageSize,
      sortField,
      sortOrder,
      debouncedSearchQuery,
    ],
    queryFn: () =>
      organizationsApi.getAllOrganizations({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        query: debouncedSearchQuery || undefined,
      }),
  });

  const organizations = useMemo(
    () => organizationsData?.items || [],
    [organizationsData?.items]
  );

  useHotkeyScope("accounts");

  const handleEditSelected = useCallback(() => {
    if (
      organizations.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < organizations.length
    ) {
      setEditingOrganization(organizations[selectedIndex]);
    }
  }, [organizations, selectedIndex]);

  const handleDeleteSelected = useCallback(() => {
    if (
      organizations.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < organizations.length
    ) {
      setDeletingOrganization(organizations[selectedIndex]);
    }
  }, [organizations, selectedIndex]);

  useHotkey("accounts.new-account", () => setCreateDialogOpen(true), {}, []);
  useHotkey(
    "accounts.refresh",
    () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ORGANIZATIONS] }),
    {},
    [queryClient]
  );
  useHotkey(
    "accounts.navigate-down",
    () => {
      if (organizations.length > 0) {
        setSelectedIndex((prev) => Math.min(prev + 1, organizations.length - 1));
      }
    },
    {},
    [organizations.length]
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
              placeholder="Search organizations by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <OrganizationsTable
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

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onOrganizationCreated={() => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.ADMIN_ORGANIZATIONS],
          });
        }}
      />

      {editingOrganization && (
        <EditOrganizationDialog
          organization={editingOrganization}
          open={!!editingOrganization}
          onOpenChange={(open) => !open && setEditingOrganization(null)}
          onOrganizationUpdated={() => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.ADMIN_ORGANIZATIONS],
            });
            setEditingOrganization(null);
          }}
        />
      )}

      {deletingOrganization && (
        <DeleteOrganizationDialog
          organization={deletingOrganization}
          open={!!deletingOrganization}
          onOpenChange={(open) => !open && setDeletingOrganization(null)}
          onOrganizationDeleted={() => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.ADMIN_ORGANIZATIONS],
            });
            setDeletingOrganization(null);
          }}
        />
      )}
    </div>
  );
}
