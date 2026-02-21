"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsClient } from "@/lib/api-clients/activity-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationsClient.list({ page, size: 25 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsClient.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsClient.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {data?.unreadCount != null && data.unreadCount > 0 && (
            <Badge variant="destructive">{data.unreadCount} unread</Badge>
          )}
        </div>
        <Button variant="outline" onClick={() => markAllReadMutation.mutate()}>
          <CheckCheck className="h-4 w-4 mr-1" />Mark All Read
        </Button>
      </div>

      <div className="space-y-2">
        {data?.items?.map((n) => (
          <Card key={n.id} className={n.isRead ? "opacity-60" : ""}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div
                className={n.entityType && n.entityId ? "cursor-pointer" : ""}
                onClick={() => {
                  if (n.entityType && n.entityId) {
                    router.push(`/${n.entityType}s/${n.entityId}`);
                  }
                }}
              >
                <div className="font-medium">{n.title}</div>
                {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.isRead && (
                <Button size="sm" variant="outline" onClick={() => markReadMutation.mutate(n.id)}>Mark Read</Button>
              )}
            </CardContent>
          </Card>
        ))}
        {(!data?.items || data.items.length === 0) && (
          <Card><CardContent className="pt-6 text-center text-muted-foreground">No notifications</CardContent></Card>
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
