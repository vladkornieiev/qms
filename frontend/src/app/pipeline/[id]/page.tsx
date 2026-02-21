"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inboundRequestsClient } from "@/lib/api-clients/quotes-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function InboundRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: req } = useQuery({
    queryKey: ["inbound-request", id],
    queryFn: () => inboundRequestsClient.get(id),
  });

  const reviewMutation = useMutation({
    mutationFn: (decision: string) => inboundRequestsClient.review(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound-request", id] });
      toast.success("Request reviewed");
    },
  });

  const convertMutation = useMutation({
    mutationFn: () => inboundRequestsClient.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound-request", id] });
      toast.success("Converted to project");
    },
  });

  if (!req) return <div className="p-6">Loading...</div>;

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      case "reviewing": return <Badge className="bg-blue-500">Reviewing</Badge>;
      case "approved": return <Badge variant="default">Approved</Badge>;
      case "denied": return <Badge variant="destructive">Denied</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/pipeline")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <h1 className="text-2xl font-bold">Inbound Request</h1>
        {statusBadge(req.status)}
      </div>

      <Card>
        <CardHeader><CardTitle>Submitter Info</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div><span className="font-medium">Name:</span> {req.submitterName || "-"}</div>
          <div><span className="font-medium">Email:</span> {req.submitterEmail || "-"}</div>
          <div><span className="font-medium">Phone:</span> {req.submitterPhone || "-"}</div>
          <div><span className="font-medium">Company:</span> {req.submitterCompany || "-"}</div>
        </CardContent>
      </Card>

      {req.formData && Object.keys(req.formData).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Form Data</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">{JSON.stringify(req.formData, null, 2)}</pre>
          </CardContent>
        </Card>
      )}

      {req.denialReason && (
        <Card>
          <CardHeader><CardTitle>Denial Reason</CardTitle></CardHeader>
          <CardContent><p>{req.denialReason}</p></CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {(req.status === "pending" || req.status === "reviewing") && (
          <>
            <Button onClick={() => reviewMutation.mutate("approved")}>Approve</Button>
            <Button variant="destructive" onClick={() => reviewMutation.mutate("denied")}>Deny</Button>
          </>
        )}
        {req.status === "approved" && !req.projectId && (
          <Button onClick={() => convertMutation.mutate()}>Convert to Project</Button>
        )}
        {req.projectId && (
          <Button variant="outline" onClick={() => router.push(`/projects/${req.projectId}`)}>View Project</Button>
        )}
      </div>
    </div>
  );
}
