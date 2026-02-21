"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesClient } from "@/lib/api-clients/templates-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Copy } from "lucide-react";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: template } = useQuery({
    queryKey: ["template", id],
    queryFn: () => templatesClient.get(id),
  });

  const cloneMutation = useMutation({
    mutationFn: () => templatesClient.clone(id),
    onSuccess: (cloned) => {
      toast.success("Template cloned");
      router.push(`/templates/${cloned.id}`);
    },
  });

  // Add item
  const [itemOpen, setItemOpen] = useState(false);
  const [itemLabel, setItemLabel] = useState("");
  const [itemType, setItemType] = useState("line_item");
  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const createItemMutation = useMutation({
    mutationFn: () => templatesClient.createItem(id, {
      itemType,
      label: itemLabel,
      description: itemDesc || undefined,
      defaultQuantity: itemQty ? parseFloat(itemQty) : undefined,
      defaultUnitPrice: itemPrice ? parseFloat(itemPrice) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template", id] });
      setItemOpen(false);
      setItemLabel("");
      setItemDesc("");
      setItemQty("");
      setItemPrice("");
      toast.success("Item added");
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => templatesClient.deleteItem(id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template", id] });
      toast.success("Item removed");
    },
  });

  if (!template) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/templates")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <Badge variant="outline">{template.templateType.replace(/_/g, " ")}</Badge>
            {template.isActive ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
          </div>
          {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => cloneMutation.mutate()}><Copy className="h-4 w-4 mr-1" />Clone</Button>
      </div>

      {/* Template Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Items</CardTitle>
          <Dialog open={itemOpen} onOpenChange={setItemOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Template Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Label *</Label><Input value={itemLabel} onChange={(e) => setItemLabel(e.target.value)} /></div>
                <div>
                  <Label>Item Type</Label>
                  <Select value={itemType} onValueChange={setItemType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="resource_role">Resource Role</SelectItem>
                      <SelectItem value="line_item">Line Item</SelectItem>
                      <SelectItem value="form_field">Form Field</SelectItem>
                      <SelectItem value="date_range">Date Range</SelectItem>
                      <SelectItem value="fee">Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Input value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Default Qty</Label><Input type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)} /></div>
                  <div><Label>Default Price</Label><Input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} /></div>
                </div>
                <Button onClick={() => createItemMutation.mutate()} disabled={!itemLabel}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell>{item.itemType.replace(/_/g, " ")}</TableCell>
                  <TableCell>{item.section || "-"}</TableCell>
                  <TableCell>{item.defaultQuantity ?? "-"}</TableCell>
                  <TableCell>{item.defaultUnitPrice != null ? `$${item.defaultUnitPrice.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{item.isRequired ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteItemMutation.mutate(item.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!template.items || template.items.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No items</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
