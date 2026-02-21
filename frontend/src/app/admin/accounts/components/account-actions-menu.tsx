"use client";

import React, { useState } from "react";
import { type Account } from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { EditAccountDialog } from "./edit-account-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";

interface AccountActionsMenuProps {
  account: Account;
  onAccountUpdated: () => void;
}

export function AccountActionsMenu({
  account,
  onAccountUpdated,
}: AccountActionsMenuProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAccountDialog
        account={account}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onAccountUpdated={onAccountUpdated}
      />

      <DeleteAccountDialog
        account={account}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onAccountDeleted={onAccountUpdated}
      />
    </>
  );
}
