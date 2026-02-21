"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsClient } from "@/lib/api-clients/dashboard-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ReportType = "projects" | "invoices" | "resources" | "clients";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("projects");

  const { data: projects } = useQuery({
    queryKey: ["reports", "projects"],
    queryFn: () => reportsClient.getProjects(),
    enabled: reportType === "projects",
  });

  const { data: invoices } = useQuery({
    queryKey: ["reports", "invoices"],
    queryFn: () => reportsClient.getInvoiceAging(),
    enabled: reportType === "invoices",
  });

  const { data: resources } = useQuery({
    queryKey: ["reports", "resources"],
    queryFn: () => reportsClient.getResourceUtilization(),
    enabled: reportType === "resources",
  });

  const { data: clients } = useQuery({
    queryKey: ["reports", "clients"],
    queryFn: () => reportsClient.getClientRevenue(),
    enabled: reportType === "clients",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select report" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="invoices">Invoice Aging</SelectItem>
            <SelectItem value="resources">Resource Utilization</SelectItem>
            <SelectItem value="clients">Client Revenue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Report */}
      {reportType === "projects" && (
        <Card>
          <CardHeader>
            <CardTitle>Projects Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Project #</th>
                    <th className="text-left py-2 px-2">Title</th>
                    <th className="text-left py-2 px-2">Client</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-right py-2 px-2">Billable</th>
                    <th className="text-right py-2 px-2">Cost</th>
                    <th className="text-right py-2 px-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {projects?.map((p) => (
                    <tr key={p.projectId} className="border-b">
                      <td className="py-2 px-2 font-mono">{p.projectNumber}</td>
                      <td className="py-2 px-2">{p.title}</td>
                      <td className="py-2 px-2">{p.clientName}</td>
                      <td className="py-2 px-2"><Badge variant="outline">{p.status}</Badge></td>
                      <td className="py-2 px-2 text-right">{formatCurrency(p.totalBillable)}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(p.totalCost)}</td>
                      <td className="py-2 px-2 text-right font-medium">{formatCurrency(p.totalProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!projects || projects.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No project data</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Aging Report */}
      {reportType === "invoices" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Aging Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Invoice #</th>
                    <th className="text-left py-2 px-2">Client</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-right py-2 px-2">Total</th>
                    <th className="text-right py-2 px-2">Balance Due</th>
                    <th className="text-left py-2 px-2">Due Date</th>
                    <th className="text-right py-2 px-2">Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((inv) => (
                    <tr key={inv.invoiceId} className="border-b">
                      <td className="py-2 px-2 font-mono">{inv.invoiceNumber}</td>
                      <td className="py-2 px-2">{inv.clientName}</td>
                      <td className="py-2 px-2">
                        <Badge variant={inv.status === "overdue" ? "destructive" : inv.status === "paid" ? "default" : "outline"}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-right">{formatCurrency(inv.total)}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(inv.balanceDue)}</td>
                      <td className="py-2 px-2">{inv.dueDate}</td>
                      <td className="py-2 px-2 text-right">
                        {inv.daysOverdue > 0 && <span className="text-red-600 font-medium">{inv.daysOverdue}d</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!invoices || invoices.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No invoice data</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Utilization Report */}
      {reportType === "resources" && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-right py-2 px-2">Booked Days</th>
                    <th className="text-right py-2 px-2">Available Days</th>
                    <th className="text-right py-2 px-2">Utilization</th>
                    <th className="text-right py-2 px-2">Total Billed</th>
                  </tr>
                </thead>
                <tbody>
                  {resources?.map((res) => (
                    <tr key={res.resourceId} className="border-b">
                      <td className="py-2 px-2 font-medium">{res.resourceName}</td>
                      <td className="py-2 px-2"><Badge variant="outline">{res.type}</Badge></td>
                      <td className="py-2 px-2 text-right">{res.totalBookedDays}</td>
                      <td className="py-2 px-2 text-right">{res.totalAvailableDays}</td>
                      <td className="py-2 px-2 text-right">{res.utilizationPercent.toFixed(1)}%</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(res.totalBilled)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!resources || resources.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No resource data</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Revenue Report */}
      {reportType === "clients" && (
        <Card>
          <CardHeader>
            <CardTitle>Client Revenue Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Client</th>
                    <th className="text-right py-2 px-2">Projects</th>
                    <th className="text-right py-2 px-2">Completed</th>
                    <th className="text-right py-2 px-2">Active</th>
                    <th className="text-right py-2 px-2">Invoiced</th>
                    <th className="text-right py-2 px-2">Paid</th>
                    <th className="text-right py-2 px-2">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {clients?.map((c) => (
                    <tr key={c.clientId} className="border-b">
                      <td className="py-2 px-2 font-medium">{c.clientName}</td>
                      <td className="py-2 px-2 text-right">{c.totalProjects}</td>
                      <td className="py-2 px-2 text-right">{c.completedProjects}</td>
                      <td className="py-2 px-2 text-right">{c.activeProjects}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(c.totalInvoiced)}</td>
                      <td className="py-2 px-2 text-right text-green-600">{formatCurrency(c.totalPaid)}</td>
                      <td className="py-2 px-2 text-right text-orange-600">{formatCurrency(c.totalOutstanding)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!clients || clients.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No client data</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
