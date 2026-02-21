"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsClient } from "@/lib/api-clients/contracts-client";
import { clientsClient } from "@/lib/api-clients/clients-client";
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

export default function ContractsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("");
  const [newClientId, setNewClientId] = useState("");

  const { data } = useQuery({
    queryKey: ["contracts", search, page, statusFilter],
    queryFn: () => contractsClient.list({
      query: search || undefined,
      status: statusFilter || undefined,
      page, size: 25,
    }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ["clients-select"],
    queryFn: () => clientsClient.list({ size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => contractsClient.create({
      title: newTitle,
      contractType: newType,
      clientId: newClientId || undefined,
    }),
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setCreateOpen(false);
      setNewTitle("");
      setNewType("");
      setNewClientId("");
      toast.success("Contract created");
      router.push(`/contracts/${contract.id}`);
    },
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      case "sent": return <Badge className="bg-blue-500">Sent</Badge>;
      case "viewed": return <Badge className="bg-purple-500">Viewed</Badge>;
      case "signed": return <Badge className="bg-green-500">Signed</Badge>;
      case "expired": return <Badge variant="outline">Expired</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Contract</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Contract</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
              <div>
                <Label>Type *</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_agreement">Service Agreement</SelectItem>
                    <SelectItem value="rental_agreement">Rental Agreement</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="nda">NDA</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Client</Label>
                <Select value={newClientId} onValueChange={setNewClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clientsData?.items?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!newTitle || !newType}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contracts..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((contract) => (
                <TableRow key={contract.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/contracts/${contract.id}`)}>
                  <TableCell className="font-medium">{contract.title}</TableCell>
                  <TableCell>{contract.contractType.replace(/_/g, " ")}</TableCell>
                  <TableCell>{contract.clientName || "-"}</TableCell>
                  <TableCell>{statusBadge(contract.status)}</TableCell>
                  <TableCell>{contract.expiresAt || "-"}</TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No contracts found</TableCell></TableRow>
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
