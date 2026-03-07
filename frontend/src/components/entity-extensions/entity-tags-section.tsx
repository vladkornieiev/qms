"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api-client";
import type { TagSummary } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Loader2 } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

interface EntityTagsSectionProps {
  entityType?: string;
  entityId?: string;
  tags: TagSummary[];
  onSave: (tagIds: string[]) => Promise<void>;
}

export function EntityTagsSection({
  tags,
  onSave,
}: EntityTagsSectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { data: allTagsData } = useQuery({
    queryKey: [QUERY_KEYS.TAGS, "all"],
    queryFn: () => tagsApi.listTags({ size: 500 }),
    enabled: editOpen,
  });

  useEffect(() => {
    if (editOpen) {
      setSelectedTagIds(tags.map((t) => t.id));
    }
  }, [editOpen, tags]);

  const mutation = useMutation({
    mutationFn: () => onSave(selectedTagIds),
    onSuccess: () => setEditOpen(false),
  });

  const allTags = allTagsData?.items || [];

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 ? (
          <span className="text-sm text-gray-400">No tags</span>
        ) : (
          tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              style={tag.color ? { backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" } : undefined}
              className="border"
            >
              {tag.color && (
                <span className="h-2 w-2 rounded-full mr-1.5 inline-block" style={{ backgroundColor: tag.color }} />
              )}
              {tag.name}
            </Badge>
          ))
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => !mutation.isPending && setEditOpen(o)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Tags</DialogTitle>
            <DialogDescription>Select tags for this entity</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-2">
            {allTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  checked={selectedTagIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                />
                <div className="flex items-center gap-1.5">
                  {tag.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />}
                  <span className="text-sm">{tag.name}</span>
                </div>
              </label>
            ))}
            {allTags.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No tags available</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={mutation.isPending}>Cancel</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
