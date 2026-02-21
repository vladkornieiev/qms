"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFieldsClient } from "@/lib/api-clients/custom-fields-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ENTITY_TYPES = ["client", "vendor", "product", "resource", "project", "quote", "invoice", "inventory_item"];
const FIELD_TYPES = ["text", "number", "boolean", "date", "datetime", "url", "email", "phone", "select", "multi_select", "collection", "file_collection"];

export default function CustomFieldsAdminPage() {
  const queryClient = useQueryClient();
  const [selectedEntityType, setSelectedEntityType] = useState("client");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");

  const { data: definitions = [] } = useQuery({
    queryKey: ["customFields", selectedEntityType],
    queryFn: () => customFieldsClient.listDefinitions(selectedEntityType),
  });

  const createMutation = useMutation({
    mutationFn: () => customFieldsClient.createDefinition(selectedEntityType, { fieldKey, fieldLabel, fieldType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customFields", selectedEntityType] });
      setCreateDialogOpen(false);
      setFieldKey("");
      setFieldLabel("");
      setFieldType("text");
      toast.success("Custom field created");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customFieldsClient.deleteDefinition(selectedEntityType, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customFields", selectedEntityType] });
      toast.success("Custom field deleted");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Custom Fields</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Field</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Custom Field for {selectedEntityType}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Field Key</Label><Input value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} placeholder="e.g. years_exp" /></div>
              <div><Label>Label</Label><Input value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="e.g. Years of Experience" /></div>
              <div>
                <Label>Type</Label>
                <Select value={fieldType} onValueChange={setFieldType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createMutation.mutate()}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ENTITY_TYPES.map((type) => (
          <Button
            key={type}
            variant={selectedEntityType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedEntityType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Field Definitions for {selectedEntityType}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {definitions.map((def) => (
              <div key={def.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{def.fieldLabel}</div>
                    <div className="text-sm text-muted-foreground">{def.fieldKey}</div>
                  </div>
                  <Badge variant="secondary">{def.fieldType}</Badge>
                  {def.isRequired && <Badge variant="destructive">Required</Badge>}
                  {def.section && <Badge variant="outline">{def.section}</Badge>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(def.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {definitions.length === 0 && <p className="text-muted-foreground text-sm">No custom fields defined for {selectedEntityType}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
