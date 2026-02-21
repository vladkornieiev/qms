"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesClient } from "@/lib/api-clients/resources-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import type { Resource } from "@/lib/api-types/resource.types";

export default function ResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDayRate, setEditDayRate] = useState("");
  const [addAvailOpen, setAddAvailOpen] = useState(false);
  const [availStart, setAvailStart] = useState("");
  const [availEnd, setAvailEnd] = useState("");
  const [availStatus, setAvailStatus] = useState("unavailable");
  const [availReason, setAvailReason] = useState("");

  const { data: resource } = useQuery({
    queryKey: ["resources", id],
    queryFn: () => resourcesClient.get(id),
  });

  const { data: availability } = useQuery({
    queryKey: ["resources", id, "availability"],
    queryFn: () => resourcesClient.listAvailability(id),
  });

  const { data: payouts } = useQuery({
    queryKey: ["resources", id, "payouts"],
    queryFn: () => resourcesClient.listPayouts(id),
  });

  const updateMutation = useMutation({
    mutationFn: () => resourcesClient.update(id, {
      firstName: editFirst || undefined,
      lastName: editLast || undefined,
      email: editEmail || undefined,
      defaultDayRate: editDayRate ? parseFloat(editDayRate) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", id] });
      setEditing(false);
      toast.success("Resource updated");
    },
  });

  const addAvailMutation = useMutation({
    mutationFn: () => resourcesClient.createAvailability(id, {
      dateStart: availStart,
      dateEnd: availEnd,
      status: availStatus,
      reason: availReason || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", id, "availability"] });
      setAddAvailOpen(false);
      setAvailStart("");
      setAvailEnd("");
      setAvailReason("");
      toast.success("Availability block created");
    },
  });

  const startEdit = (r: Resource) => {
    setEditFirst(r.firstName);
    setEditLast(r.lastName);
    setEditEmail(r.email || "");
    setEditDayRate(r.defaultDayRate?.toString() || "");
    setEditing(true);
  };

  if (!resource) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/resources")}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold">{resource.firstName} {resource.lastName}</h1>
        <Badge variant="outline">{resource.type}</Badge>
        <Badge variant={resource.isActive ? "default" : "secondary"}>{resource.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Details</CardTitle>
          {!editing && <Button variant="outline" size="sm" onClick={() => startEdit(resource)}>Edit</Button>}
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4 max-w-lg">
              <div><Label>First Name</Label><Input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} /></div>
              <div><Label>Last Name</Label><Input value={editLast} onChange={(e) => setEditLast(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
              <div><Label>Day Rate</Label><Input type="number" value={editDayRate} onChange={(e) => setEditDayRate(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button onClick={() => updateMutation.mutate()}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-muted-foreground">Email</span><p>{resource.email || "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Phone</span><p>{resource.phone || "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Day Rate</span><p>{resource.defaultDayRate != null ? `$${resource.defaultDayRate.toFixed(2)}` : "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Hour Rate</span><p>{resource.defaultHourRate != null ? `$${resource.defaultHourRate.toFixed(2)}` : "-"}</p></div>
              <div><span className="text-sm text-muted-foreground">Currency</span><p>{resource.currency}</p></div>
              <div><span className="text-sm text-muted-foreground">Location</span><p>{[resource.locationCity, resource.locationState, resource.locationCountry].filter(Boolean).join(", ") || "-"}</p></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="availability">
        <TabsList>
          <TabsTrigger value="availability">Availability ({availability?.length || 0})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({payouts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="availability">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Availability</CardTitle>
              <Dialog open={addAvailOpen} onOpenChange={setAddAvailOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Block</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Availability Block</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Start Date *</Label><Input type="date" value={availStart} onChange={(e) => setAvailStart(e.target.value)} /></div>
                    <div><Label>End Date *</Label><Input type="date" value={availEnd} onChange={(e) => setAvailEnd(e.target.value)} /></div>
                    <div><Label>Status</Label><Input value={availStatus} onChange={(e) => setAvailStatus(e.target.value)} placeholder="available, unavailable, tentative, booked" /></div>
                    <div><Label>Reason</Label><Input value={availReason} onChange={(e) => setAvailReason(e.target.value)} /></div>
                    <Button onClick={() => addAvailMutation.mutate()} disabled={!availStart || !availEnd}>Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availability?.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.dateStart}</TableCell>
                      <TableCell>{a.dateEnd}</TableCell>
                      <TableCell><Badge variant={a.status === "available" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                      <TableCell>{a.reason || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!availability || availability.length === 0) && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No availability blocks</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.description || "-"}</TableCell>
                      <TableCell>${p.amount.toFixed(2)} {p.currency}</TableCell>
                      <TableCell><Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                      <TableCell>{p.periodStart && p.periodEnd ? `${p.periodStart} - ${p.periodEnd}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {(!payouts || payouts.length === 0) && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No payouts</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
