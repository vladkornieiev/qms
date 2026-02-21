"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsClient } from "@/lib/api-clients/projects-client";
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

const statusColors: Record<string, string> = {
  pending: "secondary",
  confirmed: "default",
  in_progress: "default",
  completed: "default",
  cancelled: "destructive",
};

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [newVenueName, setNewVenueName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data } = useQuery({
    queryKey: ["projects", search, page, statusFilter],
    queryFn: () => projectsClient.list({
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
    mutationFn: () => projectsClient.create({
      title: newTitle,
      clientId: newClientId || undefined,
      priority: newPriority,
      venueName: newVenueName || undefined,
      description: newDescription || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setCreateOpen(false);
      setNewTitle("");
      setNewClientId("");
      setNewPriority("normal");
      setNewVenueName("");
      setNewDescription("");
      toast.success("Project created");
    },
  });

  const statusBadge = (status: string) => {
    const variant = statusColors[status] || "outline";
    return <Badge variant={variant as "default" | "secondary" | "destructive" | "outline"}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
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
              <div>
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Venue Name</Label><Input value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)} /></div>
              <div><Label>Description</Label><Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!newTitle}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="text-right">Billable</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((project) => (
                <TableRow key={project.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/projects/${project.id}`)}>
                  <TableCell className="font-mono text-sm">{project.projectNumber}</TableCell>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.clientName || "-"}</TableCell>
                  <TableCell>{statusBadge(project.status)}</TableCell>
                  <TableCell><Badge variant="outline">{project.priority}</Badge></TableCell>
                  <TableCell>{project.venueName || "-"}</TableCell>
                  <TableCell className="text-right">${project.totalBillable.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${project.totalProfit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No projects found</TableCell></TableRow>
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
