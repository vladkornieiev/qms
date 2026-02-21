"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsClient } from "@/lib/api-clients/clients-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const clientId = params.id as string;

  const [addContactOpen, setAddContactOpen] = useState(false);
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRole, setContactRole] = useState("");

  const { data: client } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => clientsClient.get(clientId),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["clientContacts", clientId],
    queryFn: () => clientsClient.listContacts(clientId),
  });

  const addContactMutation = useMutation({
    mutationFn: () => clientsClient.createContact(clientId, {
      firstName: contactFirstName,
      lastName: contactLastName || undefined,
      email: contactEmail || undefined,
      phone: contactPhone || undefined,
      role: contactRole || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientContacts", clientId] });
      setAddContactOpen(false);
      setContactFirstName("");
      setContactLastName("");
      setContactEmail("");
      setContactPhone("");
      setContactRole("");
      toast.success("Contact added");
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => clientsClient.deleteContact(clientId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientContacts", clientId] });
      toast.success("Contact removed");
    },
  });

  if (!client) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline">{client.type}</Badge>
            <Badge variant={client.isActive ? "default" : "secondary"}>{client.isActive ? "Active" : "Inactive"}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {client.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{client.email}</div>}
            {client.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{client.phone}</div>}
            {client.website && <div><span className="text-muted-foreground text-sm">Website:</span> {client.website}</div>}
            {client.pricingTier && <div><span className="text-muted-foreground text-sm">Pricing Tier:</span> {client.pricingTier}</div>}
            {client.notes && <div><span className="text-muted-foreground text-sm">Notes:</span><p className="mt-1">{client.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contacts</CardTitle>
              <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>First Name *</Label><Input value={contactFirstName} onChange={(e) => setContactFirstName(e.target.value)} /></div>
                      <div><Label>Last Name</Label><Input value={contactLastName} onChange={(e) => setContactLastName(e.target.value)} /></div>
                    </div>
                    <div><Label>Email</Label><Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
                    <div><Label>Phone</Label><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></div>
                    <div><Label>Role</Label><Input value={contactRole} onChange={(e) => setContactRole(e.target.value)} placeholder="e.g. Tour Manager" /></div>
                    <Button onClick={() => addContactMutation.mutate()} disabled={!contactFirstName}>Add Contact</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                      {contact.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                    </div>
                    {contact.role && <div className="text-sm text-muted-foreground ml-6">{contact.role}</div>}
                    <div className="flex gap-3 ml-6 text-sm text-muted-foreground">
                      {contact.email && <span>{contact.email}</span>}
                      {contact.phone && <span>{contact.phone}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteContactMutation.mutate(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-muted-foreground text-sm">No contacts yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
