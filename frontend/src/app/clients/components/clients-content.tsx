"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "@/lib/api-client";
import type { ClientListItem, SearchClientsRequest } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Search, Plus, Building2, Loader2, Pencil, Trash2 } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { TagFilter } from "@/components/entity-extensions/tag-filter";
import { CustomFieldFilterButton, CustomFieldFilterBar, useCustomFieldFilterData } from "@/components/entity-extensions/custom-field-filters";
import type { CustomFieldFilter } from "@/lib/api-types/entity-extensions.types";
import { CreateClientDialog } from "./create-client-dialog";
import { EditClientDialog } from "./edit-client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { ClientDetailPanel } from "./client-detail-panel";

export function ClientsContent() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [customFieldFilters, setCustomFieldFilters] = useState<CustomFieldFilter[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ClientListItem | null>(null);
  const [deleting, setDeleting] = useState<ClientListItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cfAvailableFields = useCustomFieldFilterData("CLIENT");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => setPage(0), [debouncedSearch, typeFilter, activeFilter, tagIds, customFieldFilters]);

  const searchRequest: SearchClientsRequest = {
    page,
    size: pageSize,
    query: debouncedSearch || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    isActive: activeFilter !== "all" ? activeFilter === "active" : undefined,
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    customFieldFilters: (() => {
      const active = customFieldFilters
        .filter((f) => f.value !== "" && f.enabled !== false)
        .map(({ fieldId, op, value }) => ({ fieldId, op, value }));
      return active.length > 0 ? active : undefined;
    })(),
    sortBy: "createdAt",
    order: "desc",
  };

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, searchRequest],
    queryFn: () => clientsApi.searchClients(searchRequest),
  });

  const clients = data?.items || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Clients
          </h1>
          <p className="text-gray-600 mt-1">Manage your clients and contacts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      {/* Filters */}
      <Card className="py-3">
        <CardContent className="px-3 space-y-3">
          {/* Top row: search + dropdowns + tags + add custom field */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <TagFilter selectedTagIds={tagIds} onTagIdsChange={setTagIds} entityType="CLIENT" />
            <CustomFieldFilterButton
              filters={customFieldFilters}
              onFiltersChange={setCustomFieldFilters}
              availableFields={cfAvailableFields}
            />
          </div>

          {/* Custom field filter pills (Kibana-style, below search bar) */}
          {customFieldFilters.length > 0 && (
            <CustomFieldFilterBar
              filters={customFieldFilters}
              onFiltersChange={setCustomFieldFilters}
              availableFields={cfAvailableFields}
            />
          )}
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="py-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="py-0">
            <CardContent className="p-0">
              {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Create your first client to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(client.id)}
                      >
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {client.type === "COMPANY" ? "Company" : "Individual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{client.email || "-"}</TableCell>
                        <TableCell className="text-gray-600">{client.phone || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(client.tags || []).map((tag) => (
                              <Badge
                                key={tag.id}
                                variant="secondary"
                                className="text-xs border"
                                style={tag.color ? { backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" } : undefined}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.isActive ? "default" : "secondary"} className="text-xs">
                            {client.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(client)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleting(client)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalItems={data?.totalElements || 0}
            itemName="clients"
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </>
      )}

      {/* Dialogs */}
      <CreateClientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={invalidate}
      />
      {editing && (
        <EditClientDialog
          client={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onUpdated={invalidate}
        />
      )}
      {deleting && (
        <DeleteClientDialog
          client={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          onDeleted={invalidate}
        />
      )}
      {selectedId && (
        <ClientDetailPanel
          clientId={selectedId}
          open={!!selectedId}
          onOpenChange={(o) => !o && setSelectedId(null)}
          onUpdated={invalidate}
        />
      )}
    </div>
  );
}
