"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardClient } from "@/lib/api-clients/dashboard-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: revenue } = useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () => dashboardClient.getRevenue("month"),
  });

  const { data: pipeline } = useQuery({
    queryKey: ["dashboard", "pipeline"],
    queryFn: () => dashboardClient.getPipeline(),
  });

  const { data: utilization } = useQuery({
    queryKey: ["dashboard", "utilization"],
    queryFn: () => dashboardClient.getUtilization(),
  });

  const { data: inventory } = useQuery({
    queryKey: ["dashboard", "inventory-alerts"],
    queryFn: () => dashboardClient.getInventoryAlerts(),
  });

  const { data: topClients } = useQuery({
    queryKey: ["dashboard", "top-clients"],
    queryFn: () => dashboardClient.getTopClients(5),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenue?.totalInvoiced || 0)}</div>
            <p className="text-xs text-muted-foreground">{revenue?.invoiceCount || 0} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(revenue?.totalPaid || 0)}</div>
            <p className="text-xs text-muted-foreground">{revenue?.paidCount || 0} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(revenue?.totalOutstanding || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{revenue?.overdueCount || 0}</div>
            <p className="text-xs text-muted-foreground">overdue invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipeline && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Inbound Requests</h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(pipeline.inboundByStatus || {}).map(([status, count]) => (
                        <Badge key={status} variant="outline">{status}: {count}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Quotes</h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(pipeline.quotesByStatus || {}).map(([status, count]) => (
                        <Badge key={status} variant="outline">{status}: {count}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Projects</h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(pipeline.projectsByStatus || {}).map(([status, count]) => (
                        <Badge key={status} variant="outline">{status}: {count}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Invoices</h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(pipeline.invoicesByStatus || {}).map(([status, count]) => (
                        <Badge key={status} variant="outline">{status}: {count}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {!pipeline && <p className="text-sm text-muted-foreground">Loading...</p>}
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            {utilization && (
              <div className="space-y-3">
                <div className="text-3xl font-bold">{utilization.utilizationPercent.toFixed(1)}%</div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(utilization.utilizationPercent, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold">{utilization.totalResources}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">{utilization.bookedCount}</div>
                    <div className="text-muted-foreground">Booked</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{utilization.availableCount}</div>
                    <div className="text-muted-foreground">Available</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inventory && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{inventory.lowStockCount}</div>
                    <div className="text-xs text-muted-foreground">Low Stock</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{inventory.checkedOutCount}</div>
                    <div className="text-xs text-muted-foreground">Checked Out</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{inventory.maintenanceCount}</div>
                    <div className="text-xs text-muted-foreground">Maintenance</div>
                  </div>
                </div>
                {inventory.lowStockItems.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Low Stock Items</h4>
                    {inventory.lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.productId + item.location} className="flex justify-between text-sm">
                        <span>{item.productName} ({item.location})</span>
                        <span className="text-red-600">{item.quantityOnHand} / {item.reorderPoint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients?.map((client, idx) => (
                <div key={client.clientId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-5">{idx + 1}.</span>
                    <span className="text-sm font-medium">{client.clientName}</span>
                  </div>
                  <div className="text-sm text-right">
                    <div className="font-medium">{formatCurrency(client.totalInvoiced)}</div>
                    <div className="text-xs text-muted-foreground">{client.totalProjects} projects</div>
                  </div>
                </div>
              ))}
              {(!topClients || topClients.length === 0) && (
                <p className="text-sm text-muted-foreground text-center">No client data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
