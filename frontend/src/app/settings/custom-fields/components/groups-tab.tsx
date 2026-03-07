"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFieldsApi, type CustomFieldGroup } from "@/lib/api-client";
import { formatEnum } from "@/lib/utils";
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
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  Layers,
} from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { CreateGroupDialog } from "./create-group-dialog";
import { EditGroupDialog } from "./edit-group-dialog";
import { DeleteGroupDialog } from "./delete-group-dialog";

const ENTITY_TYPES = [
  "CLIENT",
  "VENDOR",
  "PRODUCT",
  "RESOURCE",
  "PROJECT",
  "QUOTE",
  "INVOICE",
  "INVENTORY_ITEM",
];

interface GroupsTabProps {
  onChanged: () => void;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function GroupsTab({ onChanged, createOpen, onCreateOpenChange }: GroupsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [editing, setEditing] = useState<CustomFieldGroup | null>(null);
  const [deleting, setDeleting] = useState<CustomFieldGroup | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => setPage(0), [debouncedSearch, entityTypeFilter]);

  const { data, isLoading } = useQuery({
    queryKey: [
      QUERY_KEYS.CUSTOM_FIELD_GROUPS,
      page,
      pageSize,
      debouncedSearch,
      entityTypeFilter,
    ],
    queryFn: () =>
      customFieldsApi.listGroups({
        page,
        size: pageSize,
        query: debouncedSearch || undefined,
        entityType: entityTypeFilter || undefined,
      }),
  });

  const groups = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={entityTypeFilter}
              onValueChange={(v) =>
                setEntityTypeFilter(v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All entity types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entity types</SelectItem>
                {ENTITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatEnum(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Layers className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No field groups
                  </h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Create groups to assign sets of fields to entity types
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead className="w-[100px] text-center">References</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name}
                          {group.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {group.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatEnum(group.entityType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {group.fields && group.fields.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {group.fields.map((f) => (
                                <Badge
                                  key={f.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {f.fieldLabel}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No fields</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {group.referenceCount ?? 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditing(group)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => setDeleting(group)}
                            >
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
            itemName="groups"
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </>
      )}

      {/* Dialogs */}
      <CreateGroupDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        onCreated={onChanged}
      />
      {editing && (
        <EditGroupDialog
          group={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onUpdated={onChanged}
        />
      )}
      {deleting && (
        <DeleteGroupDialog
          group={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          onDeleted={onChanged}
        />
      )}
    </div>
  );
}
