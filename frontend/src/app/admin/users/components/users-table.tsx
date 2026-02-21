"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api-client";
import { useTimezoneFormat } from "@/hooks/use-timezone-format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Users, Loader2, AlertCircle, Shield, ArrowUpDown } from "lucide-react";
import { UserActionsMenu } from "@/components/users/user-actions-menu";
import { EditUserDialog } from "./edit-user-dialog";

type SortField = "name" | "email" | "createdAt";
type SortOrder = "asc" | "desc";

interface UsersTableProps {
  searchQuery: string;
  accountFilter: string;
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

export function UsersTable({
  searchQuery,
  accountFilter,
  page,
  pageSize,
  sortField,
  sortOrder,
  selectedIndex,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectedIndexChange,
}: UsersTableProps) {
  const { formatDateTime } = useTimezoneFormat();

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "admin-users",
      page,
      pageSize,
      sortField,
      sortOrder,
      searchQuery,
      accountFilter,
    ],
    queryFn: () =>
      usersApi.getAllUsers({
        page,
        size: pageSize,
        sortBy: sortField,
        order: sortOrder,
        // Search query parameter
        ...(searchQuery && { query: searchQuery }),
        // Organization filter
        ...(accountFilter !== "all" && { accountId: accountFilter }),
      }),
  });

  const users = usersData?.items || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "MEMBER":
        return "bg-green-100 text-green-800";
      case "ACCOUNTANT":
        return "bg-amber-100 text-amber-800";
      case "VIEWER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading users...</p>
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
                Error Loading Users
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : "Failed to load users"}
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
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No users found" : "No users yet"}
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-sm">
                {searchQuery
                  ? "Try adjusting your search criteria or filters"
                  : "Users will appear here once they are created"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort("name")}
                      className="h-8 -ml-3"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort("email")}
                      className="h-8 -ml-3"
                    >
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">Organization</TableHead>
                  <TableHead className="w-[250px]">Roles</TableHead>
                  <TableHead className="w-[180px]">
                    <Button
                      variant="ghost"
                      onClick={() => onSort("createdAt")}
                      className="h-8 -ml-3"
                    >
                      Created
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className={`shadow-[inset_3px_0_0_0_transparent] ${
                      selectedIndex === index
                        ? "bg-primary/10 !shadow-[inset_3px_0_0_0_hsl(var(--primary))]"
                        : "hover:bg-muted/50"
                    }`}
                    onMouseEnter={() => onSelectedIndexChange(index)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">{`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}</div>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-600">
                      {user.organization?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            className={getRoleBadgeColor(role)}
                            variant="secondary"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {role.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDateTime(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <UserActionsMenu user={user} onUserUpdated={() => refetch()} EditDialog={EditUserDialog} />
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
        totalItems={usersData?.totalElements || 0}
        itemName="users"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
}
