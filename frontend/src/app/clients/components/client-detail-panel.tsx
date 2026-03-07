"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Phone, Globe, FileText, Pencil } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { EntityTagsSection } from "@/components/entity-extensions/entity-tags-section";
import {
  CustomFieldsFormSection,
  toCustomFieldValueInputs,
  fromCustomFieldValueResponses,
} from "@/components/entity-extensions/custom-fields-form-section";

interface ClientDetailPanelProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function ClientDetailPanel({ clientId, open, onOpenChange, onUpdated }: ClientDetailPanelProps) {
  const queryClient = useQueryClient();
  const [editCfOpen, setEditCfOpen] = useState(false);
  const [cfGroupIds, setCfGroupIds] = useState<string[]>([]);
  const [cfValues, setCfValues] = useState<Record<string, unknown>>({});

  const { data: client, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, "detail", clientId],
    queryFn: () => clientsApi.getClient(clientId),
    enabled: open && !!clientId,
  });

  const handleTagsSave = async (tagIds: string[]) => {
    await clientsApi.updateClient(clientId, { tagIds });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
    onUpdated();
  };

  const openEditCustomFields = () => {
    setCfValues(fromCustomFieldValueResponses(client?.customFieldValues || []));
    setCfGroupIds([]);
    setEditCfOpen(true);
  };

  const cfMutation = useMutation({
    mutationFn: () =>
      clientsApi.updateClient(clientId, {
        customFieldValues: toCustomFieldValueInputs(cfValues),
      }),
    onSuccess: () => {
      toast.success("Custom fields updated");
      setEditCfOpen(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLIENTS] });
      onUpdated();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update custom fields"),
  });

  const renderCustomFieldValue = (value: unknown): string => {
    if (value == null) return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[450px] sm:w-[540px] overflow-y-auto">
          {isLoading || !client ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {client.name}
                  <Badge variant="outline" className="text-xs ml-2">
                    {client.type === "COMPANY" ? "Company" : "Individual"}
                  </Badge>
                  <Badge variant={client.isActive ? "default" : "secondary"} className="text-xs">
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Contact</h3>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span>{client.website}</span>
                    </div>
                  )}
                  {client.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{client.notes}</span>
                    </div>
                  )}
                  {client.pricingTier && (
                    <div className="text-sm">
                      <span className="text-gray-500">Pricing Tier:</span>{" "}
                      <span>{client.pricingTier}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Tags */}
                <EntityTagsSection
                  entityType="CLIENT"
                  entityId={clientId}
                  tags={client.tags || []}
                  onSave={handleTagsSave}
                />

                <Separator />

                {/* Custom Field Values */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Custom Fields</h3>
                    <Button variant="ghost" size="sm" onClick={openEditCustomFields}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  {client.customFieldValues && client.customFieldValues.length > 0 ? (
                    <div className="space-y-2">
                      {client.customFieldValues.map((cf) => (
                        <div key={cf.customFieldId} className="flex justify-between text-sm">
                          <span className="text-gray-500">{cf.fieldLabel}</span>
                          <span>{renderCustomFieldValue(cf.value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No custom fields</p>
                  )}
                </div>

                {/* Metadata */}
                <Separator />
                <div className="space-y-1 text-xs text-gray-400">
                  {client.createdAt && <div>Created: {new Date(client.createdAt).toLocaleDateString()}</div>}
                  {client.updatedAt && <div>Updated: {new Date(client.updatedAt).toLocaleDateString()}</div>}
                  <div className="font-mono">{client.id}</div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Custom Fields Dialog */}
      <Dialog open={editCfOpen} onOpenChange={(o) => !cfMutation.isPending && setEditCfOpen(o)}>
        <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Custom Fields</DialogTitle>
            <DialogDescription>Update custom field values for this client</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CustomFieldsFormSection
              entityType="CLIENT"
              selectedGroupIds={cfGroupIds}
              onGroupIdsChange={setCfGroupIds}
              values={cfValues}
              onValuesChange={setCfValues}
              disabled={cfMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCfOpen(false)} disabled={cfMutation.isPending}>Cancel</Button>
            <Button onClick={() => cfMutation.mutate()} disabled={cfMutation.isPending}>
              {cfMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
