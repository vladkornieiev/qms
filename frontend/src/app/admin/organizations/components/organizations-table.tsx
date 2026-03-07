"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationsApi } from "@/lib/api-client";
import type { Organization } from "@/lib/api-client";
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
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";
import {
  Building2,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";

type SortField = "name" | "createdAt";
type SortOrder = "asc" | "desc";

interface OrganizationsTableProps {
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

export function OrganizationsTable({
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
}: OrganizationsTableProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { loadUser } = useAuthStore();
  const { formatDateTime } = useTimezoneFormat();
  const [switchingOrganization, setSwitchingOrganization] = useState<string | null>(null);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState<Organization | null>(null);

  const {
    data: organizationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ORGANIZATIONS, page, pageSize, sortField, sortOrder, searchQuery],
    queryFn: () =>
      organizationsApi.getAllOrganizations({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        query: searchQuery || undefined,
      }),
  });

  const organizations = organizationsData?.items || [];

  const handleSwitchOrganization = async (organizationId: string) => {
    setSwitchingOrganization(organizationId);
    try {
      await authClient.switchOrganization(organizationId);
      await loadUser();
      queryClient.clear();
      router.push("/");
    } catch (err) {
      toast.error("Failed to switch organization", {
        description:
          err instanceof Error ? err.message : "Could not switch to organization",
      });
      setSwitchingOrganization(null);
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
          {organizations.length === 0 ? (
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
                {organizations.map((organization, index) => (
                  <TableRow
                    key={organization.id}
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
                        {organization.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {organization.email || "-"}
                    </TableCell>
                    <TableCell>
                      {organization.isActive ? (
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
                      {organization.createdAt ? formatDateTime(organization.createdAt) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwitchOrganization(organization.id)}
                          disabled={switchingOrganization === organization.id}
                          className="h-8"
                        >
                          {switchingOrganization === organization.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditing(organization)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setDeleting(organization)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaginationControls
        page={page}
        pageSize={pageSize}
        totalItems={organizationsData?.totalElements || 0}
        itemName="organizations"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {editing && (
        <EditOrganizationDialog
          organization={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onOrganizationUpdated={() => refetch()}
        />
      )}
      {deleting && (
        <DeleteOrganizationDialog
          organization={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
          onOrganizationDeleted={() => refetch()}
        />
      )}
    </>
  );
}
