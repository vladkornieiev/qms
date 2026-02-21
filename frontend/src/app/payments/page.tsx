"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentsClient } from "@/lib/api-clients/invoices-client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PaymentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["payments", page],
    queryFn: () => paymentsClient.list({ page, size: 25 }),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((pay) => (
                <TableRow key={pay.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/invoices/${pay.invoiceId}`)}>
                  <TableCell>{pay.paymentDate}</TableCell>
                  <TableCell>{pay.paymentMethod || "-"}</TableCell>
                  <TableCell>{pay.paymentReference || "-"}</TableCell>
                  <TableCell className="text-right font-medium">${pay.amount.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-sm">{pay.invoiceId.slice(0, 8)}...</TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No payments found</TableCell></TableRow>
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
