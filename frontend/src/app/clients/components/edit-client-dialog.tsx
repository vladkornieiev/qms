"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api-client";
import type { ClientListItem } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { TagSelector } from "@/components/entity-extensions/tag-selector";
import {
  CustomFieldsFormSection,
  toCustomFieldValueInputs,
  fromCustomFieldValueResponses,
} from "@/components/entity-extensions/custom-fields-form-section";

interface EditClientDialogProps {
  client: ClientListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditClientDialog({ client, open, onOpenChange, onUpdated }: EditClientDialogProps) {
  const [name, setName] = useState(client.name);
  const [type, setType] = useState(client.type);
  const [email, setEmail] = useState(client.email || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [cfGroupIds, setCfGroupIds] = useState<string[]>([]);
  const [cfValues, setCfValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch full client detail to get website, notes, tags, custom fields
  const { data: fullClient } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, "detail", client.id],
    queryFn: () => clientsApi.getClient(client.id),
    enabled: open,
  });

  useEffect(() => {
    if (fullClient) {
      setName(fullClient.name);
      setType(fullClient.type);
      setEmail(fullClient.email || "");
      setPhone(fullClient.phone || "");
      setWebsite(fullClient.website || "");
      setNotes(fullClient.notes || "");
      setTagIds((fullClient.tags || []).map((t) => t.id));
      setCfValues(fromCustomFieldValueResponses(fullClient.customFieldValues || []));
    }
    setError(null);
  }, [fullClient]);

  const mutation = useMutation({
    mutationFn: () =>
      clientsApi.updateClient(client.id, {
        name: name.trim(),
        type: type as "COMPANY" | "INDIVIDUAL",
        email: email.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        notes: notes.trim() || null,
        tagIds,
        customFieldValues: toCustomFieldValueInputs(cfValues),
      }),
    onSuccess: () => {
      toast.success("Client updated");
      onUpdated();
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message || "Failed to update client"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!mutation.isPending) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>Update client information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name <span className="text-red-500">*</span></Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} disabled={mutation.isPending} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={mutation.isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={mutation.isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input id="edit-website" placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={mutation.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={mutation.isPending} rows={3} />
            </div>

            <Separator />

            <TagSelector
              selectedTagIds={tagIds}
              onTagIdsChange={setTagIds}
              disabled={mutation.isPending}
            />

            <Separator />

            <CustomFieldsFormSection
              entityType="CLIENT"
              selectedGroupIds={cfGroupIds}
              onGroupIdsChange={setCfGroupIds}
              values={cfValues}
              onValuesChange={setCfValues}
              disabled={mutation.isPending}
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
