"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsClient } from "@/lib/api-clients/products-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [trackingFilter, setTrackingFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newProductType, setNewProductType] = useState("physical");
  const [newTrackingType, setNewTrackingType] = useState("non_tracked");
  const [newUnitPrice, setNewUnitPrice] = useState("");

  const { data } = useQuery({
    queryKey: ["products", search, page, typeFilter, trackingFilter],
    queryFn: () => productsClient.list({
      query: search || undefined,
      productType: typeFilter || undefined,
      trackingType: trackingFilter || undefined,
      page, size: 25
    }),
  });

  const createMutation = useMutation({
    mutationFn: () => productsClient.create({
      name: newName,
      sku: newSku || undefined,
      productType: newProductType,
      trackingType: newTrackingType,
      unitPrice: newUnitPrice ? parseFloat(newUnitPrice) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setCreateOpen(false);
      setNewName("");
      setNewSku("");
      setNewUnitPrice("");
      toast.success("Product created");
    },
  });

  const trackingBadge = (type: string) => {
    switch (type) {
      case "serialized": return <Badge variant="default">Serialized</Badge>;
      case "consumable": return <Badge variant="secondary">Consumable</Badge>;
      default: return <Badge variant="outline">Not Tracked</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div><Label>SKU</Label><Input value={newSku} onChange={(e) => setNewSku(e.target.value)} /></div>
              <div>
                <Label>Product Type</Label>
                <Select value={newProductType} onValueChange={setNewProductType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tracking Type</Label>
                <Select value={newTrackingType} onValueChange={setNewTrackingType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serialized">Serialized</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="non_tracked">Not Tracked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Unit Price</Label><Input type="number" value={newUnitPrice} onChange={(e) => setNewUnitPrice(e.target.value)} /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!newName}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="fee">Fee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={trackingFilter} onValueChange={(v) => { setTrackingFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Tracking" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracking</SelectItem>
            <SelectItem value="serialized">Serialized</SelectItem>
            <SelectItem value="consumable">Consumable</SelectItem>
            <SelectItem value="non_tracked">Not Tracked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((product) => (
                <TableRow key={product.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/products/${product.id}`)}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{product.productType}</Badge></TableCell>
                  <TableCell>{trackingBadge(product.trackingType)}</TableCell>
                  <TableCell>{product.unitPrice != null ? `$${product.unitPrice.toFixed(2)}` : "-"}</TableCell>
                  <TableCell><Badge variant={product.isActive ? "default" : "secondary"}>{product.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No products found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</Button>
          <span className="py-2 text-sm">Page {page + 1} of {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.totalPages - 1}>Next</Button>
        </div>
      )}
    </div>
  );
}
