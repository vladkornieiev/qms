"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tagsApi, type Tag, type TagGroup } from "@/lib/api-client";
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
import { Search, Pencil, Trash2, Loader2, Tags } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { CreateTagDialog } from "./create-tag-dialog";
import { EditTagDialog } from "./edit-tag-dialog";
import { DeleteTagDialog } from "./delete-tag-dialog";

interface TagsTabProps {
  onChanged: () => void;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
}

export function TagsTab({ onChanged, createOpen, onCreateOpenChange }: TagsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterGroupId, setFilterGroupId] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState<Tag | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => setPage(0), [debouncedSearch, filterGroupId]);

  const { data: groupsData } = useQuery({
    queryKey: [QUERY_KEYS.TAG_GROUPS, "all"],
    queryFn: () => tagsApi.listTagGroups({ size: 100 }),
  });

  const groups = useMemo(() => groupsData?.items || [], [groupsData]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TAGS, page, pageSize, debouncedSearch, filterGroupId],
    queryFn: () =>
      tagsApi.listTags({
        page,
        size: pageSize,
        query: debouncedSearch || undefined,
        tagGroupId: filterGroupId,
      }),
  });

  const tags = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <Card className="py-3">
        <CardContent className="px-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {groups.length > 0 && (
              <Select
                value={filterGroupId ?? "all"}
                onValueChange={(v) => setFilterGroupId(v === "all" ? undefined : v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
              {tags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Tags className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tags found
                  </h3>
                  <p className="text-gray-600 text-center max-w-sm">
                    Create your first tag to start organizing entities
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead className="w-[80px]">Color</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {tag.color && (
                              <div
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                            )}
                            {tag.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tag.tagGroupName ? (
                            <Badge variant="outline">{tag.tagGroupName}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {tag.color ? (
                            <code className="text-xs">{tag.color}</code>
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
                              onClick={() => setEditing(tag)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => setDeleting(tag)}
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
            itemName="tags"
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </>
      )}

      {/* Dialogs */}
      <CreateTagDialog
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        groups={groups}
        onCreated={onChanged}
      />
      {editing && (
        <EditTagDialog
          tag={editing}
          groups={groups}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onUpdated={onChanged}
        />
      )}
      {deleting && (
        <DeleteTagDialog
          tag={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          onDeleted={onChanged}
        />
      )}
    </div>
  );
}
