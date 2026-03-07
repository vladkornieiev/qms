"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { DefinitionsTab } from "./definitions-tab";
import { GroupsTab } from "./groups-tab";

export function CustomFieldsContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("definitions");
  const [createDefinitionOpen, setCreateDefinitionOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CUSTOM_FIELD_DEFINITIONS],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CUSTOM_FIELD_GROUPS],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SlidersHorizontal className="h-8 w-8" />
            Custom Fields
          </h1>
          <p className="text-gray-600 mt-1">
            Define custom fields and group them for different entity types
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "definitions" ? (
            <Button onClick={() => setCreateDefinitionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Field
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
          <TabsTrigger value="definitions">Field Definitions</TabsTrigger>
          <TabsTrigger value="groups">Field Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="definitions" className="mt-4">
          <DefinitionsTab
            onChanged={invalidateAll}
            createOpen={createDefinitionOpen}
            onCreateOpenChange={setCreateDefinitionOpen}
          />
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <GroupsTab
            onChanged={invalidateAll}
            createOpen={createGroupOpen}
            onCreateOpenChange={setCreateGroupOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
