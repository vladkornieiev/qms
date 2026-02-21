export interface RevenueSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  periodLabel: string;
}

export interface PipelineSummary {
  inboundByStatus: Record<string, number>;
  quotesByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  invoicesByStatus: Record<string, number>;
}

export interface UtilizationSummary {
  totalResources: number;
  bookedCount: number;
  availableCount: number;
  utilizationPercent: number;
}

export interface InventoryAlerts {
  lowStockCount: number;
  checkedOutCount: number;
  maintenanceCount: number;
  lowStockItems: LowStockItem[];
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  location: string;
  quantityOnHand: number;
  reorderPoint: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalProjects: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface ProjectReportRow {
  projectId: string;
  projectNumber: string;
  title: string;
  status: string;
  clientName: string;
  totalBillable: number;
  totalCost: number;
  totalProfit: number;
  createdAt: string;
}

export interface InvoiceAgingRow {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  status: string;
  total: number;
  balanceDue: number;
  issuedDate: string;
  dueDate: string;
  daysOverdue: number;
}

export interface ResourceUtilizationRow {
  resourceId: string;
  resourceName: string;
  type: string;
  totalBookedDays: number;
  totalAvailableDays: number;
  utilizationPercent: number;
  totalBilled: number;
}

export interface ClientRevenueRow {
  clientId: string;
  clientName: string;
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
}
