"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "@/lib/api-client";
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
import { TagSelector } from "@/components/entity-extensions/tag-selector";
import {
  CustomFieldsFormSection,
  toCustomFieldValueInputs,
} from "@/components/entity-extensions/custom-fields-form-section";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateClientDialog({ open, onOpenChange, onCreated }: CreateClientDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"COMPANY" | "INDIVIDUAL">("COMPANY");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [cfGroupIds, setCfGroupIds] = useState<string[]>([]);
  const [cfValues, setCfValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      clientsApi.createClient({
        name: name.trim(),
        type,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        customFieldValues: toCustomFieldValueInputs(cfValues).length > 0
          ? toCustomFieldValueInputs(cfValues)
          : undefined,
      }),
    onSuccess: () => {
      toast.success("Client created");
      onCreated();
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => setError(err.message || "Failed to create client"),
  });

  const resetForm = () => {
    setName("");
    setType("COMPANY");
    setEmail("");
    setPhone("");
    setWebsite("");
    setNotes("");
    setTagIds([]);
    setCfGroupIds([]);
    setCfValues({});
    setError(null);
  };

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
    <Dialog open={open} onOpenChange={(o) => { if (!mutation.isPending) { resetForm(); onOpenChange(o); } }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Client</DialogTitle>
          <DialogDescription>Add a new client to your organization</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Name <span className="text-red-500">*</span></Label>
              <Input id="client-name" placeholder="e.g., Acme Corp" value={name} onChange={(e) => setName(e.target.value)} disabled={mutation.isPending} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "COMPANY" | "INDIVIDUAL")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input id="client-email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={mutation.isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Phone</Label>
                <Input id="client-phone" placeholder="+1-555-0100" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={mutation.isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-website">Website</Label>
              <Input id="client-website" placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={mutation.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea id="client-notes" placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={mutation.isPending} rows={3} />
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
