"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

export function TagSelector({
  selectedTagIds,
  onTagIdsChange,
  disabled,
}: TagSelectorProps) {
  const [search, setSearch] = useState("");

  const { data: tagsData } = useQuery({
    queryKey: [QUERY_KEYS.TAGS, "selector"],
    queryFn: () => tagsApi.listTags({ size: 500 }),
  });

  const allTags = tagsData?.items || [];

  const filteredTags = useMemo(() => {
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, search]);

  const toggleTag = (tagId: string) => {
    onTagIdsChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };

  if (allTags.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Tags</p>
      {allTags.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
            disabled={disabled}
          />
        </div>
      )}
      <div className="max-h-[150px] overflow-y-auto space-y-1">
        {filteredTags.map((tag) => (
          <label
            key={tag.id}
            className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
          >
            <Checkbox
              checked={selectedTagIds.includes(tag.id)}
              onCheckedChange={() => toggleTag(tag.id)}
              disabled={disabled}
            />
            {tag.color && (
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
              />
            )}
            {tag.name}
          </label>
        ))}
        {filteredTags.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No tags found</p>
        )}
      </div>
    </div>
  );
}
