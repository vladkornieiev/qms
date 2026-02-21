"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesClient } from "@/lib/api-clients/categories-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/api-types/category.types";

function CategoryNode({ category, level = 0, onDelete }: { category: Category; level?: number; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between p-2 border rounded hover:bg-accent" style={{ marginLeft: level * 24 }}>
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : <div className="w-4" />}
          <span className="font-medium">{category.name}</span>
          {category.code && <span className="text-muted-foreground text-sm">({category.code})</span>}
          <span className="text-xs px-2 py-0.5 rounded bg-muted">{category.type}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {expanded && category.children?.map((child) => (
        <CategoryNode key={child.id} category={child} level={level + 1} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("income");
  const [newParentId, setNewParentId] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesClient.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => categoriesClient.create({
      name: newName,
      type: newType,
      code: newCode || undefined,
      parentId: newParentId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCreateDialogOpen(false);
      setNewName("");
      setNewCode("");
      toast.success("Category created");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
  });

  const flatCategories = flattenCategories(categories);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div><Label>Code (optional)</Label><Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. 4010" /></div>
              <div>
                <Label>Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Parent (optional)</Label>
                <select className="w-full border rounded p-2" value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
                  <option value="">None (root)</option>
                  {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Button onClick={() => createMutation.mutate()}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Category Tree</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {categories.map((cat) => (
              <CategoryNode key={cat.id} category={cat} onDelete={(id) => deleteMutation.mutate(id)} />
            ))}
            {categories.length === 0 && <p className="text-muted-foreground text-sm">No categories yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function flattenCategories(categories: Category[], result: Category[] = []): Category[] {
  for (const cat of categories) {
    result.push(cat);
    if (cat.children) flattenCategories(cat.children, result);
  }
  return result;
}
