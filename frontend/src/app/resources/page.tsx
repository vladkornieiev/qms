"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesClient } from "@/lib/api-clients/resources-client";
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

export default function ResourcesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newType, setNewType] = useState("contractor");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDayRate, setNewDayRate] = useState("");

  const { data } = useQuery({
    queryKey: ["resources", search, page, typeFilter],
    queryFn: () => resourcesClient.list({
      query: search || undefined,
      type: typeFilter || undefined,
      page, size: 25,
    }),
  });

  const createMutation = useMutation({
    mutationFn: () => resourcesClient.create({
      firstName: newFirstName,
      lastName: newLastName,
      type: newType,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      defaultDayRate: newDayRate ? parseFloat(newDayRate) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setCreateOpen(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPhone("");
      setNewDayRate("");
      toast.success("Resource created");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Resources</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Resource</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Resource</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>First Name *</Label><Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} /></div>
              <div><Label>Last Name *</Label><Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} /></div>
              <div>
                <Label>Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Email</Label><Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
              <div><Label>Day Rate</Label><Input type="number" value={newDayRate} onChange={(e) => setNewDayRate(e.target.value)} /></div>
              <Button onClick={() => createMutation.mutate()} disabled={!newFirstName || !newLastName}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Day Rate</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items?.map((resource) => (
                <TableRow key={resource.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`/resources/${resource.id}`)}>
                  <TableCell className="font-medium">{resource.firstName} {resource.lastName}</TableCell>
                  <TableCell><Badge variant="outline">{resource.type}</Badge></TableCell>
                  <TableCell>{resource.email || "-"}</TableCell>
                  <TableCell>{resource.phone || "-"}</TableCell>
                  <TableCell>{resource.defaultDayRate != null ? `$${resource.defaultDayRate.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{[resource.locationCity, resource.locationState, resource.locationCountry].filter(Boolean).join(", ") || "-"}</TableCell>
                  <TableCell><Badge variant={resource.isActive ? "default" : "secondary"}>{resource.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No resources found</TableCell></TableRow>
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
