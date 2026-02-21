"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesClient } from "@/lib/api-clients/resources-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PayoutsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["payouts", statusFilter, page],
    queryFn: () => resourcesClient.listAllPayouts({
      status: statusFilter || undefined,
      page, size: 25,
    }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => resourcesClient.approvePayout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      toast.success("Payout approved");
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => resourcesClient.markPayoutPaid(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      toast.success("Payout marked as paid");
    },
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "approved": return <Badge className="bg-blue-500">Approved</Badge>;
      case "paid": return <Badge variant="default">Paid</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
      </div>

      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.resourceName}</TableCell>
                  <TableCell>{payout.description || "-"}</TableCell>
                  <TableCell>${payout.amount.toFixed(2)} {payout.currency}</TableCell>
                  <TableCell>{statusBadge(payout.status)}</TableCell>
                  <TableCell>{payout.periodStart && payout.periodEnd ? `${payout.periodStart} - ${payout.periodEnd}` : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {payout.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(payout.id)}>Approve</Button>
                      )}
                      {payout.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => markPaidMutation.mutate(payout.id)}>Mark Paid</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No payouts found</TableCell></TableRow>
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
