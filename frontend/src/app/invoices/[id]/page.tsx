"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesClient } from "@/lib/api-clients/invoices-client";
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
import { ArrowLeft, Plus, RefreshCw, Send, Ban, DollarSign } from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: invoice } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesClient.get(id),
  });

  const sendMutation = useMutation({
    mutationFn: () => invoicesClient.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast.success("Invoice sent");
    },
  });

  const voidMutation = useMutation({
    mutationFn: () => invoicesClient.voidInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast.success("Invoice voided");
    },
  });

  const recalcMutation = useMutation({
    mutationFn: () => invoicesClient.recalculate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast.success("Totals recalculated");
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
    mutationFn: () => invoicesClient.createLineItem(id, {
      description: lineDesc,
      quantity: parseFloat(lineQty),
      unitPrice: parseFloat(linePrice),
      unit: lineUnit,
      section: lineSection || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      setLineOpen(false);
      setLineDesc("");
      setLineQty("1");
      setLinePrice("0");
      setLineSection("");
      toast.success("Line item added");
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: (lineId: string) => invoicesClient.deleteLineItem(id, lineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast.success("Line item removed");
    },
  });

  // Record payment
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMethod, setPayMethod] = useState("");
  const [payRef, setPayRef] = useState("");

  const recordPaymentMutation = useMutation({
    mutationFn: () => invoicesClient.recordPayment(id, {
      amount: parseFloat(payAmount),
      paymentDate: payDate,
      paymentMethod: payMethod || undefined,
      paymentReference: payRef || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      setPayOpen(false);
      setPayAmount("");
      setPayRef("");
      toast.success("Payment recorded");
    },
  });

  if (!invoice) return <div className="p-6">Loading...</div>;

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      case "sent": return <Badge className="bg-blue-500">Sent</Badge>;
      case "viewed": return <Badge className="bg-purple-500">Viewed</Badge>;
      case "partially_paid": return <Badge className="bg-yellow-500">Partially Paid</Badge>;
      case "paid": return <Badge className="bg-green-500">Paid</Badge>;
      case "overdue": return <Badge variant="destructive">Overdue</Badge>;
      case "void": return <Badge variant="outline">Void</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/invoices")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            {statusBadge(invoice.status)}
          </div>
          {invoice.clientName && <p className="text-sm text-muted-foreground">Client: {invoice.clientName}</p>}
          {invoice.dueDate && <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {invoice.status === "draft" && (
          <Button onClick={() => sendMutation.mutate()}><Send className="h-4 w-4 mr-1" />Send</Button>
        )}
        {invoice.status !== "void" && invoice.status !== "paid" && (
          <Button variant="destructive" onClick={() => voidMutation.mutate()}><Ban className="h-4 w-4 mr-1" />Void</Button>
        )}
        <Button variant="outline" onClick={() => recalcMutation.mutate()}><RefreshCw className="h-4 w-4 mr-1" />Recalculate</Button>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Subtotal</div><div className="text-xl font-bold">${invoice.subtotal.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Discount</div><div className="text-xl font-bold">-${invoice.discountAmount.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Tax</div><div className="text-xl font-bold">${invoice.taxAmount.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">${invoice.total.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Paid</div><div className="text-xl font-bold text-green-600">${invoice.amountPaid.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Balance Due</div><div className="text-2xl font-bold text-red-600">${invoice.balanceDue.toFixed(2)}</div></CardContent></Card>
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
                <TableHead>Discount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.section || "-"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{item.discountPercent > 0 ? `${item.discountPercent}%` : item.discountAmount > 0 ? `$${item.discountAmount.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{item.taxRate > 0 ? `${item.taxRate}%` : "-"}</TableCell>
                  <TableCell className="text-right font-medium">${item.lineTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteLineMutation.mutate(item.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!invoice.lineItems || invoice.lineItems.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No line items</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          {invoice.status !== "void" && invoice.status !== "paid" && (
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><DollarSign className="h-4 w-4 mr-1" />Record Payment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Amount *</Label><Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} /></div>
                  <div><Label>Date *</Label><Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} /></div>
                  <div>
                    <Label>Method</Label>
                    <Select value={payMethod} onValueChange={setPayMethod}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Reference</Label><Input value={payRef} onChange={(e) => setPayRef(e.target.value)} /></div>
                  <Button onClick={() => recordPaymentMutation.mutate()} disabled={!payAmount || !payDate}>Record</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.payments?.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell>{pay.paymentDate}</TableCell>
                  <TableCell>{pay.paymentMethod || "-"}</TableCell>
                  <TableCell>{pay.paymentReference || "-"}</TableCell>
                  <TableCell className="text-right font-medium">${pay.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {(!invoice.payments || invoice.payments.length === 0) && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No payments</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {(invoice.notes || invoice.terms) && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            {invoice.notes && <div><span className="font-medium">Notes:</span> {invoice.notes}</div>}
            {invoice.terms && <div><span className="font-medium">Terms:</span> {invoice.terms}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
