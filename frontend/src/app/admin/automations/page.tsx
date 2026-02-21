"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowRulesClient } from "@/lib/api-clients/automation-client";
import type { CreateWorkflowRuleRequest } from "@/lib/api-types/automation.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Zap } from "lucide-react";

export default function AutomationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateWorkflowRuleRequest>({
    name: "",
    triggerEntity: "",
    triggerEvent: "",
    triggerConditions: {},
    actions: [],
    executionOrder: 0,
  });

  const { data } = useQuery({
    queryKey: ["workflow-rules", page],
    queryFn: () => workflowRulesClient.list({ page, size: 25 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWorkflowRuleRequest) => workflowRulesClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      setCreateOpen(false);
      setForm({ name: "", triggerEntity: "", triggerEvent: "", triggerConditions: {}, actions: [], executionOrder: 0 });
      toast.success("Workflow rule created");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => workflowRulesClient.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowRulesClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      toast.success("Workflow rule deleted");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Automations</h1>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" />New Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workflow Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Entity</Label>
                  <Input placeholder="e.g. project, invoice" value={form.triggerEntity} onChange={(e) => setForm({ ...form, triggerEntity: e.target.value })} />
                </div>
                <div>
                  <Label>Trigger Event</Label>
                  <Input placeholder="e.g. status_changed, created" value={form.triggerEvent} onChange={(e) => setForm({ ...form, triggerEvent: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Trigger Conditions (JSON)</Label>
                <Textarea
                  placeholder='{"new_status": "approved"}'
                  onChange={(e) => {
                    try { setForm({ ...form, triggerConditions: JSON.parse(e.target.value) }); } catch { /* ignore parse errors while typing */ }
                  }}
                />
              </div>
              <div>
                <Label>Actions (JSON array)</Label>
                <Textarea
                  placeholder='[{"type": "send_email", "to": "client"}]'
                  onChange={(e) => {
                    try { setForm({ ...form, actions: JSON.parse(e.target.value) }); } catch { /* ignore parse errors while typing */ }
                  }}
                />
              </div>
              <div>
                <Label>Execution Order</Label>
                <Input type="number" value={form.executionOrder || 0} onChange={(e) => setForm({ ...form, executionOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.triggerEntity || !form.triggerEvent}>
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {data?.items?.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleMutation.mutate(rule.id)}
                  />
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(rule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rule.description && <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>}
              <div className="flex gap-4 text-sm">
                <span>Trigger: <strong>{rule.triggerEntity}.{rule.triggerEvent}</strong></span>
                <span>Order: {rule.executionOrder}</span>
                <span>Actions: {rule.actions?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!data?.items || data.items.length === 0) && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No workflow rules configured. Create one to automate your processes.
            </CardContent>
          </Card>
        )}
      </div>

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
