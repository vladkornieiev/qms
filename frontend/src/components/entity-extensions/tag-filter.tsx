"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tags, Search } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Badge } from "@/components/ui/badge";
import type { TagSummary } from "@/lib/api-types";

interface TagFilterProps {
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
  entityType?: string;
}

interface TagWithGroup {
  tag: TagSummary;
  groupName: string;
  groupColor?: string;
}

export function TagFilter({ selectedTagIds, onTagIdsChange, entityType }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch distinct in-use tags (flat list, to know which tags have data)
  const { data: tagsData } = useQuery({
    queryKey: [QUERY_KEYS.TAGS, "filter", entityType],
    queryFn: () => tagsApi.listTags({ size: 500, distinct: true, entityType }),
  });

  // Fetch tag groups (for grouping display)
  const { data: groupsData } = useQuery({
    queryKey: [QUERY_KEYS.TAG_GROUPS, "forFilters"],
    queryFn: () => tagsApi.listTagGroups({ size: 500 }),
  });

  const inUseTags = tagsData?.items || [];
  const groups = groupsData?.items || [];

  // Build tags grouped by tag group, only including in-use tags
  const availableTags = useMemo(() => {
    const inUseIds = new Set(inUseTags.map((t) => t.id));
    const tagMap = new Map<string, TagWithGroup>();

    for (const group of groups) {
      for (const tag of group.tags || []) {
        if (inUseIds.has(tag.id) && !tagMap.has(tag.id)) {
          tagMap.set(tag.id, { tag, groupName: group.name, groupColor: group.color });
        }
      }
    }

    // Any in-use tags not in a group get "Other"
    for (const tag of inUseTags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, { tag: { id: tag.id, name: tag.name, color: tag.color }, groupName: "Other" });
      }
    }

    return Array.from(tagMap.values());
  }, [inUseTags, groups]);

  // Filter by search
  const filteredTags = useMemo(() => {
    if (!search.trim()) return availableTags;
    const q = search.toLowerCase();
    return availableTags.filter(
      (t) => t.tag.name.toLowerCase().includes(q) || t.groupName.toLowerCase().includes(q)
    );
  }, [availableTags, search]);

  // Group filtered tags by group name
  const groupedTags = useMemo(() => {
    const map = new Map<string, TagWithGroup[]>();
    for (const t of filteredTags) {
      const list = map.get(t.groupName) || [];
      list.push(t);
      map.set(t.groupName, list);
    }
    return Array.from(map.entries());
  }, [filteredTags]);

  const toggleTag = (tagId: string) => {
    onTagIdsChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9">
          <Tags className="h-4 w-4" />
          Tags
          {selectedTagIds.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{selectedTagIds.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {groupedTags.map(([groupName, tags]) => (
            <div key={groupName}>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-2 pt-2 pb-1">
                {groupName}
              </p>
              {tags.map((t) => (
                <label key={t.tag.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedTagIds.includes(t.tag.id)}
                    onCheckedChange={() => toggleTag(t.tag.id)}
                  />
                  {t.tag.color && <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: t.tag.color }} />}
                  {t.tag.name}
                </label>
              ))}
            </div>
          ))}
          {filteredTags.length === 0 && availableTags.length > 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No matching tags</p>
          )}
          {availableTags.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No tags</p>}
        </div>
        {selectedTagIds.length > 0 && (
          <div className="pt-2 border-t mt-2">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onTagIdsChange([])}>
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
