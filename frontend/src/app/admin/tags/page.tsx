"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsClient } from "@/lib/api-clients/tags-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { TagGroup, Tag } from "@/lib/api-types/tag.types";

export default function TagsAdminPage() {
  const queryClient = useQueryClient();
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#3b82f6");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [newTagGroupId, setNewTagGroupId] = useState<string>("");

  const { data: tagGroups = [] } = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => tagsClient.listTagGroups(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsClient.listTags(),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => tagsClient.createTagGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagGroups"] });
      setGroupDialogOpen(false);
      setNewGroupName("");
      toast.success("Tag group created");
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => tagsClient.deleteTagGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagGroups"] });
      toast.success("Tag group deleted");
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color: string; tagGroupId?: string }) => tagsClient.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setTagDialogOpen(false);
      setNewTagName("");
      toast.success("Tag created");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagsClient.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag deleted");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tags</h1>
        <div className="flex gap-2">
          <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />New Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Tag Group</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} /></div>
                <div><Label>Color</Label><Input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} /></div>
                <Button onClick={() => createGroupMutation.mutate({ name: newGroupName, color: newGroupColor })}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Tag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Tag</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} /></div>
                <div><Label>Color</Label><Input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} /></div>
                <div>
                  <Label>Group (optional)</Label>
                  <select className="w-full border rounded p-2" value={newTagGroupId} onChange={(e) => setNewTagGroupId(e.target.value)}>
                    <option value="">No group</option>
                    {tagGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <Button onClick={() => createTagMutation.mutate({ name: newTagName, color: newTagColor, tagGroupId: newTagGroupId || undefined })}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Tag Groups</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tagGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: group.color || "#gray" }} />
                    <span>{group.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteGroupMutation.mutate(group.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {tagGroups.length === 0 && <p className="text-muted-foreground text-sm">No tag groups yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-1">
                  <Badge style={{ backgroundColor: tag.color || undefined }} variant="secondary">
                    {tag.name}
                    {tag.tagGroupName && <span className="text-xs ml-1 opacity-70">({tag.tagGroupName})</span>}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteTagMutation.mutate(tag.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {tags.length === 0 && <p className="text-muted-foreground text-sm">No tags yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
