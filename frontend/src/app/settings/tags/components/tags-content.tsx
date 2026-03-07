"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tags, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { TagGroupsTab } from "./tag-groups-tab";
import { TagsTab } from "./tags-tab";

export function TagsContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tags");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [createTagOpen, setCreateTagOpen] = useState(false);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAG_GROUPS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAGS] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tags className="h-8 w-8" />
            Tags
          </h1>
          <p className="text-gray-600 mt-1">
            Organize entities with tag groups and tags
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "tags" ? (
            <Button onClick={() => setCreateTagOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          ) : (
            <Button onClick={() => setCreateGroupOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="groups">Tag Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="tags" className="mt-4">
          <TagsTab
            onChanged={invalidateAll}
            createOpen={createTagOpen}
            onCreateOpenChange={setCreateTagOpen}
          />
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <TagGroupsTab
            onChanged={invalidateAll}
            createOpen={createGroupOpen}
            onCreateOpenChange={setCreateGroupOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
