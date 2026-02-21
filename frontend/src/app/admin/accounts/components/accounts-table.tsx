"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountsApi } from "@/lib/api-client";
import { useTimezoneFormat } from "@/hooks/use-timezone-format";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth-store";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { AccountActionsMenu } from "./account-actions-menu";
import {
  Building2,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

type SortField = "name" | "createdAt";
type SortOrder = "asc" | "desc";

interface AccountsTableProps {
  searchQuery: string;
  page: number;
  pageSize: number;
  sortField: SortField;
  sortOrder: SortOrder;
  selectedIndex: number;
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectedIndexChange: (index: number) => void;
}

export function AccountsTable({
  searchQuery,
  page,
  pageSize,
  sortField,
  sortOrder,
  selectedIndex,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectedIndexChange,
}: AccountsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { loadUser } = useAuthStore();
  const { formatDateTime } = useTimezoneFormat();
  const [switchingAccount, setSwitchingAccount] = useState<string | null>(null);

  const {
    data: accountsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ACCOUNTS, page, pageSize, sortField, sortOrder, searchQuery],
    queryFn: () =>
      accountsApi.getAllAccounts({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        query: searchQuery || undefined,
      }),
  });

  const accounts = accountsData?.items || [];

  const handleSwitchAccount = async (accountId: string) => {
    setSwitchingAccount(accountId);
    try {
      await authClient.switchAccount(accountId);
      await loadUser();
      queryClient.clear();
      router.push("/projects");
    } catch (err) {
      toast.error("Failed to switch organization", {
        description:
          err instanceof Error ? err.message : "Could not switch to organization",
      });
      setSwitchingAccount(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading organizations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Organizations
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : "Failed to load organizations"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="py-0">
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No organizations found" : "No organizations yet"}
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-sm">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Organizations will appear here once they are created"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort("name")}
                      className="h-8 -ml-3"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort("createdAt")}
                      className="h-8 -ml-3"
                    >
                      Created
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account, index) => (
                  <TableRow
                    key={account.id}
                    className={`shadow-[inset_3px_0_0_0_transparent] ${
                      selectedIndex === index
                        ? "bg-primary/10 !shadow-[inset_3px_0_0_0_hsl(var(--primary))]"
                        : "hover:bg-muted/50"
                    }`}
                    onMouseEnter={() => onSelectedIndexChange(index)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {account.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {account.email || "-"}
                    </TableCell>
                    <TableCell>
                      {account.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {account.createdAt ? formatDateTime(account.createdAt) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwitchAccount(account.id)}
                          disabled={switchingAccount === account.id}
                          className="h-8"
                        >
                          {switchingAccount === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </Button>
                        <AccountActionsMenu
                          account={account}
                          onAccountUpdated={() => refetch()}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={accountsData?.totalElements || 0}
        itemName="organizations"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
}
