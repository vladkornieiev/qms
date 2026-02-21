"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalItems: number;
  itemName: string; // e.g., "accounts", "users"
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  itemName,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalItems);

  const handlePageSizeChange = (value: string) => {
    onPageSizeChange(Number.parseInt(value));
    onPageChange(0); // Reset to first page when changing page size
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <Card className="py-2">
      <CardContent className="px-4 py-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {startItem} to {endItem} of {totalItems} {itemName}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(Math.max(0, page - 1))}
                  disabled={page === 0}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-gray-600 px-4">
                  Page {page + 1} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
