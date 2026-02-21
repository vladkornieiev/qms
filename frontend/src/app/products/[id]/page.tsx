"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsClient } from "@/lib/api-clients/products-client";
import { inventoryClient } from "@/lib/api-clients/inventory-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import type { Product } from "@/lib/api-types/product.types";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const { data: product } = useQuery({
    queryKey: ["products", id],
    queryFn: () => productsClient.get(id),
  });

  const { data: children } = useQuery({
    queryKey: ["products", id, "children"],
    queryFn: () => productsClient.listChildren(id),
  });

  const { data: inventoryItems } = useQuery({
    queryKey: ["products", id, "inventory"],
    queryFn: () => productsClient.listInventory(id),
    enabled: product?.trackingType === "serialized",
  });

  const { data: stockLevels } = useQuery({
    queryKey: ["products", id, "stock"],
    queryFn: () => productsClient.listStock(id),
    enabled: product?.trackingType === "consumable",
  });

  const updateMutation = useMutation({
    mutationFn: () => productsClient.update(id, {
      name: editName || undefined,
      sku: editSku || undefined,
      description: editDescription || undefined,
      unitPrice: editUnitPrice ? parseFloat(editUnitPrice) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      setEditing(false);
      toast.success("Product updated");
    },
  });

  const addItemMutation = useMutation({
    mutationFn: () => inventoryClient.createItem({
      productId: id,
      serialNumber: newSerial || undefined,
      barcode: newBarcode || undefined,
      location: newLocation || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", id, "inventory"] });
      setAddItemOpen(false);
      setNewSerial("");
      setNewBarcode("");
      setNewLocation("");
      toast.success("Inventory item added");
    },
  });

  const startEdit = (p: Product) => {
    setEditName(p.name);
    setEditSku(p.sku || "");
    setEditDescription(p.description || "");
    setEditUnitPrice(p.unitPrice?.toString() || "");
    setEditing(true);
  };

  if (!product) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/products")}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Badge variant="outline">{product.productType}</Badge>
        <Badge variant={product.isActive ? "default" : "secondary"}>{product.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Details</CardTitle>
          {!editing && <Button variant="outline" size="sm" onClick={() => startEdit(product)}>Edit</Button>}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4 max-w-lg">
              <div><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
              <div><Label>SKU</Label><Input value={editSku} onChange={(e) => setEditSku(e.target.value)} /></div>
              <div><Label>Description</Label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
              <div><Label>Unit Price</Label><Input type="number" value={editUnitPrice} onChange={(e) => setEditUnitPrice(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button onClick={() => updateMutation.mutate()}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-muted-foreground">SKU</span><p>{product.sku || "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Unit Price</span><p>{product.unitPrice != null ? `$${product.unitPrice.toFixed(2)}` : "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Price Unit</span><p>{product.priceUnit || "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Cost Price</span><p>{product.costPrice != null ? `$${product.costPrice.toFixed(2)}` : "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Tracking Type</span><p>{product.trackingType}</p></div>
              <div><span className="text-sm text-muted-foreground">Description</span><p>{product.description || "-"}</p></div>
              {product.trackingType === "consumable" && (
                <>
                  <div><span className="text-sm text-muted-foreground">Unit of Measure</span><p>{product.unitOfMeasure || "-"}</p></div>
                  <div><span className="text-sm text-muted-foreground">Reorder Point</span><p>{product.reorderPoint ?? "-"}</p></div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="children">
        <TabsList>
          <TabsTrigger value="children">Sub-Products ({children?.length || 0})</TabsTrigger>
          {product.trackingType === "serialized" && (
            <TabsTrigger value="inventory">Inventory Items ({inventoryItems?.length || 0})</TabsTrigger>
          )}
          {product.trackingType === "consumable" && (
            <TabsTrigger value="stock">Stock Levels ({stockLevels?.length || 0})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="children">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {children?.map((child) => (
                    <TableRow key={child.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/products/${child.id}`)}>
                      <TableCell className="font-medium">{child.name}</TableCell>
                      <TableCell><Badge variant="outline">{child.productType}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{child.trackingType}</Badge></TableCell>
                      <TableCell>{child.unitPrice != null ? `$${child.unitPrice.toFixed(2)}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!children || children.length === 0) && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No sub-products</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {product.trackingType === "serialized" && (
          <TabsContent value="inventory">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Inventory Items</CardTitle>
                <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Item</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label>Serial Number</Label><Input value={newSerial} onChange={(e) => setNewSerial(e.target.value)} /></div>
                      <div><Label>Barcode</Label><Input value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} /></div>
                      <div><Label>Location</Label><Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} /></div>
                      <Button onClick={() => addItemMutation.mutate()}>Add</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems?.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/inventory/${item.id}`)}>
                        <TableCell>{item.serialNumber || "-"}</TableCell>
                        <TableCell>{item.barcode || "-"}</TableCell>
                        <TableCell><Badge variant={item.status === "available" ? "default" : "secondary"}>{item.status}</Badge></TableCell>
                        <TableCell>{item.condition || "-"}</TableCell>
                        <TableCell>{item.location || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {(!inventoryItems || inventoryItems.length === 0) && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No inventory items</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {product.trackingType === "consumable" && (
          <TabsContent value="stock">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>On Hand</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLevels?.map((sl) => (
                      <TableRow key={sl.id}>
                        <TableCell className="font-medium">{sl.location}</TableCell>
                        <TableCell>{sl.quantityOnHand}</TableCell>
                        <TableCell>{sl.quantityReserved}</TableCell>
                        <TableCell>{sl.quantityOnHand - sl.quantityReserved}</TableCell>
                      </TableRow>
                    ))}
                    {(!stockLevels || stockLevels.length === 0) && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No stock levels</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
