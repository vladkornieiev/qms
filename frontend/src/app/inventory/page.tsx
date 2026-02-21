"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryClient } from "@/lib/api-clients/inventory-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["inventory-items", search, statusFilter, page],
    queryFn: () => inventoryClient.listItems({
      query: search || undefined,
      status: statusFilter || undefined,
      page, size: 25
    }),
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "available": return <Badge variant="default">Available</Badge>;
      case "checked_out": return <Badge className="bg-orange-500">Checked Out</Badge>;
      case "reserved": return <Badge variant="secondary">Reserved</Badge>;
      case "maintenance": return <Badge className="bg-yellow-500">Maintenance</Badge>;
      case "retired": return <Badge variant="destructive">Retired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by serial number or barcode..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Ownership</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/inventory/${item.id}`)}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.serialNumber || "-"}</TableCell>
                  <TableCell>{item.barcode || "-"}</TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell>{item.condition || "-"}</TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{item.ownership}</Badge></TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No inventory items found</TableCell></TableRow>
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
