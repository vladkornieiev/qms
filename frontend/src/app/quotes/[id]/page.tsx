"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesClient } from "@/lib/api-clients/quotes-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, RefreshCw, Send, Copy } from "lucide-react";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: quote } = useQuery({
    queryKey: ["quote", id],
    queryFn: () => quotesClient.get(id),
  });

  const sendMutation = useMutation({
    mutationFn: () => quotesClient.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast.success("Quote sent");
    },
  });

  const recalcMutation = useMutation({
    mutationFn: () => quotesClient.recalculate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast.success("Totals recalculated");
    },
  });

  const newVersionMutation = useMutation({
    mutationFn: () => quotesClient.createNewVersion(id),
    onSuccess: (newQuote) => {
      toast.success("New version created");
      router.push(`/quotes/${newQuote.id}`);
    },
  });

  // Add line item
  const [lineOpen, setLineOpen] = useState(false);
  const [lineDesc, setLineDesc] = useState("");
  const [lineQty, setLineQty] = useState("1");
  const [linePrice, setLinePrice] = useState("0");
  const [lineUnit, setLineUnit] = useState("each");
  const [lineSection, setLineSection] = useState("");

  const createLineMutation = useMutation({
    mutationFn: () => quotesClient.createLineItem(id, {
      description: lineDesc,
      quantity: parseFloat(lineQty),
      unitPrice: parseFloat(linePrice),
      unit: lineUnit,
      section: lineSection || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      setLineOpen(false);
      setLineDesc("");
      setLineQty("1");
      setLinePrice("0");
      setLineSection("");
      toast.success("Line item added");
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: (lineId: string) => quotesClient.deleteLineItem(id, lineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast.success("Line item removed");
    },
  });

  if (!quote) return <div className="p-6">Loading...</div>;

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      case "sent": return <Badge className="bg-blue-500">Sent</Badge>;
      case "approved": return <Badge variant="default">Approved</Badge>;
      case "declined": return <Badge variant="destructive">Declined</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/quotes")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{quote.title || quote.quoteNumber}</h1>
            <Badge variant="outline">{quote.quoteNumber} v{quote.version}</Badge>
            {statusBadge(quote.status)}
          </div>
          {quote.clientName && <p className="text-sm text-muted-foreground">Client: {quote.clientName}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {quote.status === "draft" && (
          <Button onClick={() => sendMutation.mutate()}><Send className="h-4 w-4 mr-1" />Send</Button>
        )}
        <Button variant="outline" onClick={() => recalcMutation.mutate()}><RefreshCw className="h-4 w-4 mr-1" />Recalculate</Button>
        <Button variant="outline" onClick={() => newVersionMutation.mutate()}><Copy className="h-4 w-4 mr-1" />New Version</Button>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Subtotal</div><div className="text-xl font-bold">${quote.subtotal.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Discount</div><div className="text-xl font-bold">-${quote.discountAmount.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Tax</div><div className="text-xl font-bold">${quote.taxAmount.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">${quote.total.toFixed(2)} {quote.currency}</div></CardContent></Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Dialog open={lineOpen} onOpenChange={setLineOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Line Item</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Description *</Label><Input value={lineDesc} onChange={(e) => setLineDesc(e.target.value)} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Quantity</Label><Input type="number" value={lineQty} onChange={(e) => setLineQty(e.target.value)} /></div>
                  <div><Label>Unit Price</Label><Input type="number" value={linePrice} onChange={(e) => setLinePrice(e.target.value)} /></div>
                  <div><Label>Unit</Label><Input value={lineUnit} onChange={(e) => setLineUnit(e.target.value)} /></div>
                </div>
                <div><Label>Section</Label><Input value={lineSection} onChange={(e) => setLineSection(e.target.value)} /></div>
                <Button onClick={() => createLineMutation.mutate()} disabled={!lineDesc}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.lineItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.section || "-"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.discountPercent > 0 ? `${item.discountPercent}%` : item.discountAmount > 0 ? `$${item.discountAmount.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{item.taxRate > 0 ? `${item.taxRate}%` : "-"}</TableCell>
                  <TableCell className="text-right font-medium">${item.lineTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteLineMutation.mutate(item.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!quote.lineItems || quote.lineItems.length === 0) && (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No line items</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info */}
      {(quote.notes || quote.terms) && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            {quote.notes && <div><span className="font-medium">Notes:</span> {quote.notes}</div>}
            {quote.terms && <div><span className="font-medium">Terms:</span> {quote.terms}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
