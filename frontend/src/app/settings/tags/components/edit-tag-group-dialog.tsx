"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagsApi, type TagGroup } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, AlertCircle, ChevronsUpDown, Search, X } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

interface EditTagGroupDialogProps {
  group: TagGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditTagGroupDialog({
  group,
  open,
  onOpenChange,
  onUpdated,
}: EditTagGroupDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const { data: tagsData } = useQuery({
    queryKey: [QUERY_KEYS.TAGS, "all"],
    queryFn: () => tagsApi.listTags({ size: 200 }),
    enabled: open,
  });

  const allTags = tagsData?.items || [];

  const filteredTags = useMemo(
    () =>
      allTags.filter((tag) =>
        tag.name.toLowerCase().includes(tagSearch.toLowerCase())
      ),
    [allTags, tagSearch]
  );

  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [allTags, selectedTagIds]
  );

  useEffect(() => {
    setName(group.name || "");
    setColor(group.color || "");
    setDescription(group.description || "");
    setSelectedTagIds(group.tags?.map((t) => t.id) || []);
    setTagSearch("");
  }, [group]);

  const mutation = useMutation({
    mutationFn: () =>
      tagsApi.updateTagGroup(group.id, {
        name: name.trim() !== group.name ? name.trim() : undefined,
        color: color.trim() !== (group.color || "") ? color.trim() || undefined : undefined,
        description:
          description.trim() !== (group.description || "")
            ? description.trim() || undefined
            : undefined,
        tagIds: selectedTagIds,
      }),
    onSuccess: () => {
      toast.success("Tag group updated");
      onUpdated();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to update tag group");
    },
  });

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !mutation.isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Tag Group</DialogTitle>
          <DialogDescription>Update group details and member tags</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mutation.isPending}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-group-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={mutation.isPending}
                  maxLength={7}
                  className="flex-1"
                />
                {color && (
                  <div
                    className="h-10 w-10 rounded border"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-group-desc">Description</Label>
              <Textarea
                id="edit-group-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={mutation.isPending}
              />
            </div>
            {allTags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <Popover open={tagDropdownOpen} onOpenChange={setTagDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                      disabled={mutation.isPending}
                    >
                      <span className="text-muted-foreground">
                        {selectedTagIds.length > 0
                          ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? "s" : ""} selected`
                          : "Select tags..."}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tags..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="pl-8 h-8"
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredTags.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tags found
                        </p>
                      ) : (
                        filteredTags.map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded px-2 py-1.5"
                          >
                            <Checkbox
                              checked={selectedTagIds.includes(tag.id)}
                              onCheckedChange={() => toggleTag(tag.id)}
                            />
                            <div className="flex items-center gap-1.5">
                              {tag.color && (
                                <div
                                  className="h-3 w-3 rounded-full shrink-0"
                                  style={{ backgroundColor: tag.color }}
                                />
                              )}
                              <span className="text-sm">{tag.name}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {tag.color && (
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                        )}
                        {tag.name}
                        <button
                          type="button"
                          className="rounded-full hover:bg-gray-300 p-0.5"
                          onClick={() => toggleTag(tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
