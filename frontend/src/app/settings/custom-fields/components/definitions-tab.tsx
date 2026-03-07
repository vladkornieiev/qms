"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFieldsApi, type CustomFieldDefinition } from "@/lib/api-client";
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
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Search,
  Pencil,
  Trash2,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { CreateDefinitionDialog } from "./create-definition-dialog";
import { EditDefinitionDialog } from "./edit-definition-dialog";
import { DeleteDefinitionDialog } from "./delete-definition-dialog";

interface DefinitionsTabProps {
  onChanged: () => void;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function DefinitionsTab({ onChanged, createOpen, onCreateOpenChange }: DefinitionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [editing, setEditing] = useState<CustomFieldDefinition | null>(null);
  const [deleting, setDeleting] = useState<CustomFieldDefinition | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => setPage(0), [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: [
      QUERY_KEYS.CUSTOM_FIELD_DEFINITIONS,
      page,
      pageSize,
      debouncedSearch,
    ],
    queryFn: () =>
      customFieldsApi.listDefinitions({
        page,
        size: pageSize,
        query: debouncedSearch || undefined,
      }),
  });

  const defs = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
              {defs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <SlidersHorizontal className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No field definitions
                  </h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Create custom field definitions to extend your entities
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[80px] text-center">Required</TableHead>
                      <TableHead className="w-[100px] text-center">References</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defs.map((def) => (
                      <TableRow key={def.id}>
                        <TableCell className="font-medium">
                          {def.fieldLabel}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {def.fieldKey}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatEnum(def.fieldType)}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {def.isRequired ? (
                            <Badge className="bg-amber-100 text-amber-800">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm text-gray-600">
                            {def.referenceCount ?? 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditing(def)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => setDeleting(def)}
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
            itemName="definitions"
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </>
      )}

      {/* Dialogs */}
      <CreateDefinitionDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        onCreated={onChanged}
      />
      {editing && (
        <EditDefinitionDialog
          definition={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onUpdated={onChanged}
        />
      )}
      {deleting && (
        <DeleteDefinitionDialog
          definition={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          onDeleted={onChanged}
        />
      )}
    </div>
  );
}
