"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryClient } from "@/lib/api-clients/inventory-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

export default function InventoryItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkOutNotes, setCheckOutNotes] = useState("");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInCondition, setCheckInCondition] = useState("");
  const [checkInLocation, setCheckInLocation] = useState("");
  const [checkInNotes, setCheckInNotes] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferLocation, setTransferLocation] = useState("");

  const { data: item } = useQuery({
    queryKey: ["inventory-items", id],
    queryFn: () => inventoryClient.getItem(id),
  });

  const { data: transactions } = useQuery({
    queryKey: ["inventory-transactions", id],
    queryFn: () => inventoryClient.listTransactions({ inventoryItemId: id, size: 50 }),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => inventoryClient.checkOut(id, { notes: checkOutNotes || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions", id] });
      setCheckOutOpen(false);
      setCheckOutNotes("");
      toast.success("Item checked out");
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => inventoryClient.checkIn(id, {
      condition: checkInCondition || undefined,
      location: checkInLocation || undefined,
      notes: checkInNotes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions", id] });
      setCheckInOpen(false);
      setCheckInCondition("");
      setCheckInLocation("");
      setCheckInNotes("");
      toast.success("Item checked in");
    },
  });

  const transferMutation = useMutation({
    mutationFn: () => inventoryClient.transferItem(id, { location: transferLocation }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions", id] });
      setTransferOpen(false);
      setTransferLocation("");
      toast.success("Item transferred");
    },
  });

  if (!item) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/inventory")}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold">{item.productName}</h1>
        <Badge variant={item.status === "available" ? "default" : "secondary"}>{item.status}</Badge>
      </div>

      <div className="flex gap-2">
        {item.status === "available" && (
          <Dialog open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <DialogTrigger asChild><Button>Check Out</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Check Out Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Notes</Label><Input value={checkOutNotes} onChange={(e) => setCheckOutNotes(e.target.value)} /></div>
                <Button onClick={() => checkOutMutation.mutate()}>Confirm Check Out</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {item.status === "checked_out" && (
          <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
            <DialogTrigger asChild><Button>Check In</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Check In Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Condition</Label><Input value={checkInCondition} onChange={(e) => setCheckInCondition(e.target.value)} placeholder="good, fair, damaged..." /></div>
                <div><Label>Location</Label><Input value={checkInLocation} onChange={(e) => setCheckInLocation(e.target.value)} /></div>
                <div><Label>Notes</Label><Input value={checkInNotes} onChange={(e) => setCheckInNotes(e.target.value)} /></div>
                <Button onClick={() => checkInMutation.mutate()}>Confirm Check In</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogTrigger asChild><Button variant="outline">Transfer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Transfer Item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>New Location *</Label><Input value={transferLocation} onChange={(e) => setTransferLocation(e.target.value)} /></div>
              <Button onClick={() => transferMutation.mutate()} disabled={!transferLocation}>Confirm Transfer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-sm text-muted-foreground">Serial Number</span><p>{item.serialNumber || "-"}</p></div>
            <div><span className="text-sm text-muted-foreground">Barcode</span><p>{item.barcode || "-"}</p></div>
            <div><span className="text-sm text-muted-foreground">Condition</span><p>{item.condition || "-"}</p></div>
            <div><span className="text-sm text-muted-foreground">Ownership</span><p>{item.ownership}</p></div>
            <div><span className="text-sm text-muted-foreground">Location</span><p>{item.location || "-"}</p></div>
            <div><span className="text-sm text-muted-foreground">Purchase Price</span><p>{item.purchasePrice != null ? `$${item.purchasePrice.toFixed(2)}` : "-"}</p></div>
            <div><span className="text-sm text-muted-foreground">Notes</span><p>{item.notes || "-"}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.items?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell><Badge variant="outline">{tx.transactionType}</Badge></TableCell>
                  <TableCell>{tx.notes || "-"}</TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {(!transactions?.items || transactions.items.length === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No transactions</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
