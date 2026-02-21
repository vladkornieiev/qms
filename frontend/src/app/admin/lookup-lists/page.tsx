"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lookupListsClient } from "@/lib/api-clients/lookup-lists-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { LookupList, LookupListDetail } from "@/lib/api-types/lookup.types";

export default function LookupListsAdminPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [newItemLabel, setNewItemLabel] = useState("");

  const { data: lists = [] } = useQuery({
    queryKey: ["lookupLists"],
    queryFn: () => lookupListsClient.list(),
  });

  const { data: selectedList } = useQuery({
    queryKey: ["lookupList", selectedListId],
    queryFn: () => lookupListsClient.get(selectedListId!),
    enabled: !!selectedListId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) => lookupListsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookupLists"] });
      setCreateDialogOpen(false);
      setNewName("");
      setNewSlug("");
      toast.success("Lookup list created");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lookupListsClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookupLists"] });
      setSelectedListId(null);
      toast.success("Lookup list deleted");
    },
  });

  const createItemMutation = useMutation({
    mutationFn: (data: { listId: string; value: string; label: string }) =>
      lookupListsClient.createItem(data.listId, { value: data.value, label: data.label }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookupList", selectedListId] });
      setNewItemValue("");
      setNewItemLabel("");
      toast.success("Item added");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (data: { listId: string; itemId: string }) =>
      lookupListsClient.deleteItem(data.listId, data.itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookupList", selectedListId] });
      toast.success("Item deleted");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lookup Lists</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New List</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Lookup List</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div><Label>Slug</Label><Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="e.g. skills" /></div>
              <Button onClick={() => createMutation.mutate({ name: newName, slug: newSlug })}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Lists</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full text-left p-2 rounded flex items-center justify-between hover:bg-accent ${selectedListId === list.id ? "bg-accent" : ""}`}
                >
                  <span>{list.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
              {lists.length === 0 && <p className="text-muted-foreground text-sm">No lookup lists yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedList?.name || "Select a list"}</CardTitle>
              {selectedList && !selectedList.isSystem && (
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(selectedList.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />Delete
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedList ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Value" value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} />
                  <Input placeholder="Label" value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)} />
                  <Button onClick={() => createItemMutation.mutate({ listId: selectedList.id, value: newItemValue, label: newItemLabel })}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {selectedList.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground text-sm ml-2">({item.value})</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteItemMutation.mutate({ listId: selectedList.id, itemId: item.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Select a list to view its items</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
