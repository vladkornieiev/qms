"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationsClient } from "@/lib/api-clients/automation-client";
import type { CreateIntegrationRequest } from "@/lib/api-types/automation.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, RefreshCw, Trash2, Plug, History } from "lucide-react";

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [syncLogId, setSyncLogId] = useState<string | null>(null);
  const [syncLogPage, setSyncLogPage] = useState(0);
  const [form, setForm] = useState<CreateIntegrationRequest>({ provider: "" });

  const { data: integrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => integrationsClient.list(),
  });

  const { data: syncLog } = useQuery({
    queryKey: ["sync-log", syncLogId, syncLogPage],
    queryFn: () => integrationsClient.getSyncLog(syncLogId!, { page: syncLogPage, size: 25 }),
    enabled: !!syncLogId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateIntegrationRequest) => integrationsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setCreateOpen(false);
      setForm({ provider: "" });
      toast.success("Integration connected");
    },
    onError: () => {
      toast.error("Failed to connect integration");
    },
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => integrationsClient.sync(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["sync-log"] });
      toast.success("Sync completed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => integrationsClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Integration disconnected");
    },
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "connected": return "default" as const;
      case "disconnected": return "secondary" as const;
      case "error": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plug className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Integrations</h1>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" />Connect Integration</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Integration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Provider</Label>
                <Input placeholder="e.g. xero, quickbooks, stripe, docusign" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.provider}>
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations?.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">{integration.provider}</CardTitle>
                <Badge variant={statusColor(integration.status)}>{integration.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                {integration.lastSyncedAt
                  ? `Last synced: ${new Date(integration.lastSyncedAt).toLocaleString()}`
                  : "Never synced"}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => syncMutation.mutate(integration.id)} disabled={integration.status === "disconnected"}>
                  <RefreshCw className="h-3 w-3 mr-1" />Sync
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setSyncLogId(integration.id); setSyncLogPage(0); }}>
                  <History className="h-3 w-3 mr-1" />Log
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(integration.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!integrations || integrations.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No integrations configured. Connect one to sync your data.
            </CardContent>
          </Card>
        )}
      </div>

      {syncLogId && (
        <Dialog open={!!syncLogId} onOpenChange={() => setSyncLogId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sync Log</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {syncLog?.items?.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b text-sm">
                  <div>
                    <span className="font-medium">{entry.entityType}</span>
                    <span className="text-muted-foreground ml-2">{entry.direction}</span>
                    {entry.externalId && <span className="text-muted-foreground ml-2">ext: {entry.externalId}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.status === "success" ? "default" : entry.status === "error" ? "destructive" : "secondary"}>
                      {entry.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {(!syncLog?.items || syncLog.items.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No sync log entries</p>
              )}
            </div>
            {syncLog && syncLog.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSyncLogPage(Math.max(0, syncLogPage - 1))} disabled={syncLogPage === 0}>Previous</Button>
                <span className="py-2 text-sm">Page {syncLogPage + 1} of {syncLog.totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setSyncLogPage(syncLogPage + 1)} disabled={syncLogPage >= syncLog.totalPages - 1}>Next</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
