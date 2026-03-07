"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { tagsApi, type TagGroup } from "@/lib/api-client";
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
import { Search, Pencil, Trash2, Loader2, Layers } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { CreateTagGroupDialog } from "./create-tag-group-dialog";
import { EditTagGroupDialog } from "./edit-tag-group-dialog";
import { DeleteTagGroupDialog } from "./delete-tag-group-dialog";

interface TagGroupsTabProps {
  onChanged: () => void;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function TagGroupsTab({ onChanged, createOpen, onCreateOpenChange }: TagGroupsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [editing, setEditing] = useState<TagGroup | null>(null);
  const [deleting, setDeleting] = useState<TagGroup | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => setPage(0), [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TAG_GROUPS, page, pageSize, debouncedSearch],
    queryFn: () =>
      tagsApi.listTagGroups({
        page,
        size: pageSize,
        query: debouncedSearch || undefined,
      }),
  });

  const groups = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search groups..."
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
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Layers className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tag groups
                  </h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Create groups to organize your tags
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-[80px]">Color</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {group.color && (
                              <div
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: group.color }}
                              />
                            )}
                            <div>
                              {group.name}
                              {group.description && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {group.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {group.tags && group.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {group.tags.map((t) => (
                                <Badge
                                  key={t.id}
                                  variant="secondary"
                                  className="text-xs gap-1"
                                >
                                  {t.color && (
                                    <div
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{ backgroundColor: t.color }}
                                    />
                                  )}
                                  {t.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No tags</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {group.color ? (
                            <code className="text-xs">{group.color}</code>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
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
      <CreateTagGroupDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        onCreated={onChanged}
      />
      {editing && (
        <EditTagGroupDialog
          group={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onUpdated={onChanged}
        />
      )}
      {deleting && (
        <DeleteTagGroupDialog
          group={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          onDeleted={onChanged}
        />
      )}
    </div>
  );
}
