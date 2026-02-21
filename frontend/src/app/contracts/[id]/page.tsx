"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsClient } from "@/lib/api-clients/contracts-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: contract } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => contractsClient.get(id),
  });

  const sendMutation = useMutation({
    mutationFn: () => contractsClient.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract", id] });
      toast.success("Contract sent");
    },
  });

  const signMutation = useMutation({
    mutationFn: () => contractsClient.sign(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract", id] });
      toast.success("Contract signed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => contractsClient.delete(id),
    onSuccess: () => {
      toast.success("Contract deleted");
      router.push("/contracts");
    },
  });

  if (!contract) return <div className="p-6">Loading...</div>;

  const statusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      case "sent": return <Badge className="bg-blue-500">Sent</Badge>;
      case "signed": return <Badge className="bg-green-500">Signed</Badge>;
      case "expired": return <Badge variant="outline">Expired</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/contracts")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{contract.title}</h1>
            {statusBadge(contract.status)}
          </div>
          <p className="text-sm text-muted-foreground">Type: {contract.contractType.replace(/_/g, " ")}</p>
          {contract.clientName && <p className="text-sm text-muted-foreground">Client: {contract.clientName}</p>}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {contract.status === "draft" && (
          <Button onClick={() => sendMutation.mutate()}><Send className="h-4 w-4 mr-1" />Send</Button>
        )}
        {(contract.status === "sent" || contract.status === "viewed") && (
          <Button onClick={() => signMutation.mutate()}><CheckCircle className="h-4 w-4 mr-1" />Mark Signed</Button>
        )}
        <Button variant="destructive" onClick={() => deleteMutation.mutate()}>Delete</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6"><span className="text-sm text-muted-foreground">Created</span><div>{new Date(contract.createdAt).toLocaleDateString()}</div></CardContent></Card>
        {contract.expiresAt && <Card><CardContent className="pt-6"><span className="text-sm text-muted-foreground">Expires</span><div>{contract.expiresAt}</div></CardContent></Card>}
        {contract.sentAt && <Card><CardContent className="pt-6"><span className="text-sm text-muted-foreground">Sent</span><div>{new Date(contract.sentAt).toLocaleDateString()}</div></CardContent></Card>}
        {contract.signedAt && <Card><CardContent className="pt-6"><span className="text-sm text-muted-foreground">Signed</span><div>{new Date(contract.signedAt).toLocaleDateString()}</div></CardContent></Card>}
      </div>

      {contract.notes && (
        <Card>
          <CardContent className="pt-6">
            <span className="font-medium">Notes:</span> {contract.notes}
          </CardContent>
        </Card>
      )}

      {contract.templateContent && (
        <Card>
          <CardContent className="pt-6">
            <span className="font-medium">Content:</span>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{contract.templateContent}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
