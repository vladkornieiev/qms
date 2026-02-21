"use client";

import React, { useState } from "react";
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
import { DeleteUserDialog } from "./delete-user-dialog";

interface BaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface EditUserDialogProps<T extends BaseUser> {
  user: T;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

interface UserActionsMenuProps<T extends BaseUser> {
  user: T;
  onUserUpdated: () => void;
  EditDialog: React.ComponentType<EditUserDialogProps<T>>;
}

export function UserActionsMenu<T extends BaseUser>({
  user,
  onUserUpdated,
  EditDialog,
}: UserActionsMenuProps<T>) {
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

      <EditDialog
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdated={onUserUpdated}
      />

      <DeleteUserDialog
        user={user}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onUserDeleted={onUserUpdated}
      />
    </>
  );
}
