"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsClient } from "@/lib/api-clients/projects-client";
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
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsClient.get(id),
  });

  // Status transition
  const statusMutation = useMutation({
    mutationFn: (status: string) => projectsClient.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Status updated");
    },
  });

  // Recalculate
  const recalcMutation = useMutation({
    mutationFn: () => projectsClient.recalculate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Totals recalculated");
    },
  });

  // Date Range
  const [drOpen, setDrOpen] = useState(false);
  const [drDateStart, setDrDateStart] = useState("");
  const [drDateEnd, setDrDateEnd] = useState("");
  const [drLabel, setDrLabel] = useState("");

  const createDrMutation = useMutation({
    mutationFn: () => projectsClient.createDateRange(id, {
      dateStart: drDateStart,
      dateEnd: drDateEnd,
      label: drLabel || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setDrOpen(false);
      setDrDateStart("");
      setDrDateEnd("");
      setDrLabel("");
      toast.success("Date range added");
    },
  });

  const deleteDrMutation = useMutation({
    mutationFn: (rangeId: string) => projectsClient.deleteDateRange(id, rangeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Date range removed");
    },
  });

  // Resource confirm
  const confirmResourceMutation = useMutation({
    mutationFn: (prId: string) => projectsClient.confirmResource(id, prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Resource confirmed");
    },
  });

  const removeResourceMutation = useMutation({
    mutationFn: (prId: string) => projectsClient.removeResource(id, prId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Resource removed");
    },
  });

  // Product actions
  const checkOutMutation = useMutation({
    mutationFn: (ppId: string) => projectsClient.checkOutProduct(id, ppId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Product checked out");
    },
  });

  const returnMutation = useMutation({
    mutationFn: (ppId: string) => projectsClient.returnProduct(id, ppId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Product returned");
    },
  });

  const removeProductMutation = useMutation({
    mutationFn: (ppId: string) => projectsClient.removeProduct(id, ppId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Product removed");
    },
  });

  if (!project) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Badge variant="outline">{project.projectNumber}</Badge>
            <Badge>{project.status}</Badge>
            <Badge variant="outline">{project.priority}</Badge>
          </div>
          {project.clientName && <p className="text-sm text-muted-foreground">Client: {project.clientName}</p>}
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex gap-2 flex-wrap">
        <Select value={project.status} onValueChange={(v) => statusMutation.mutate(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => recalcMutation.mutate()}>
          <RefreshCw className="h-4 w-4 mr-1" />Recalculate
        </Button>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Billable</div><div className="text-2xl font-bold">${project.totalBillable.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Total Cost</div><div className="text-2xl font-bold">${project.totalCost.toFixed(2)}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Profit</div><div className="text-2xl font-bold">${project.totalProfit.toFixed(2)}</div></CardContent></Card>
      </div>

      {/* Info */}
      {(project.venueName || project.description) && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            {project.venueName && <div><span className="font-medium">Venue:</span> {project.venueName}</div>}
            {project.description && <div><span className="font-medium">Description:</span> {project.description}</div>}
          </CardContent>
        </Card>
      )}

      {/* Date Ranges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Date Ranges</CardTitle>
          <Dialog open={drOpen} onOpenChange={setDrOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Date Range</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Start Date *</Label><Input type="date" value={drDateStart} onChange={(e) => setDrDateStart(e.target.value)} /></div>
                <div><Label>End Date *</Label><Input type="date" value={drDateEnd} onChange={(e) => setDrDateEnd(e.target.value)} /></div>
                <div><Label>Label</Label><Input value={drLabel} onChange={(e) => setDrLabel(e.target.value)} /></div>
                <Button onClick={() => createDrMutation.mutate()} disabled={!drDateStart || !drDateEnd}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Rate Multiplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.dateRanges?.map((dr) => (
                <TableRow key={dr.id}>
                  <TableCell>{dr.label || "-"}</TableCell>
                  <TableCell>{dr.dateStart}</TableCell>
                  <TableCell>{dr.dateEnd}</TableCell>
                  <TableCell>{dr.rateMultiplier}x</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => deleteDrMutation.mutate(dr.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!project.dateRanges || project.dateRanges.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No date ranges</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Resources</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Bill Rate</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.resources?.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.resourceName}</TableCell>
                  <TableCell>{pr.role || "-"}</TableCell>
                  <TableCell>{pr.billRate != null ? `$${pr.billRate.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{pr.payRate != null ? `$${pr.payRate.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{pr.rateUnit}</TableCell>
                  <TableCell><Badge variant={pr.status === "confirmed" ? "default" : "secondary"}>{pr.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {pr.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => confirmResourceMutation.mutate(pr.id)}>Confirm</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => removeResourceMutation.mutate(pr.id)}>Remove</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!project.resources || project.resources.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No resources assigned</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Bill Rate</TableHead>
                <TableHead>Cost Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.products?.map((pp) => (
                <TableRow key={pp.id}>
                  <TableCell className="font-medium">{pp.productName}</TableCell>
                  <TableCell>{pp.vendorName || "-"}</TableCell>
                  <TableCell>{pp.quantity}</TableCell>
                  <TableCell>{pp.billRate != null ? `$${pp.billRate.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>{pp.costRate != null ? `$${pp.costRate.toFixed(2)}` : "-"}</TableCell>
                  <TableCell><Badge variant="outline">{pp.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {pp.status === "requested" && (
                        <Button size="sm" variant="outline" onClick={() => checkOutMutation.mutate(pp.id)}>Check Out</Button>
                      )}
                      {pp.status === "checked_out" && (
                        <Button size="sm" variant="outline" onClick={() => returnMutation.mutate(pp.id)}>Return</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => removeProductMutation.mutate(pp.id)}>Remove</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!project.products || project.products.length === 0) && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No products assigned</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
