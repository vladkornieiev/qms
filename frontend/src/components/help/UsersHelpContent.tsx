"use client";

import React from "react";
import {
  HelpCircle,
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Keyboard,
  ArrowUpDown,
} from "lucide-react";
import { HelpSection, Kbd } from "./shared";

export function UsersHelpContent() {
  return (
    <>
      <HelpSection
        title="User Management Overview"
        icon={<Users className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="bg-primary/10 rounded-lg p-4 mb-3">
          <p className="font-medium text-primary mb-2">
            What is User Management?
          </p>
          <p className="text-foreground text-sm">
            The User Management page lets administrators create, edit, and
            manage users in your organization. You can assign roles to control what
            each user can access.
          </p>
        </div>

        <p className="text-muted-foreground">From this page you can:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2 text-xs">
          <li>View all users in your organization</li>
          <li>Search for users by name or email</li>
          <li>Create new users and send invitation emails</li>
          <li>Edit user details and roles</li>
          <li>Delete users from the system</li>
        </ul>
      </HelpSection>

      <HelpSection title="Finding Users" icon={<Search className="h-5 w-5" />}>
        <p className="text-muted-foreground mb-3">
          Quickly find users with the search bar:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-xs">
          <li>
            Type in the <strong>Search box</strong> at the top
          </li>
          <li>
            Search by <strong>name</strong> or <strong>email address</strong>
          </li>
          <li>Results filter automatically as you type</li>
        </ol>

        <div className="bg-muted/50 rounded p-3 mt-3">
          <p className="text-xs">
            <strong>Tip:</strong> Clear the search box to see all users again.
          </p>
        </div>
      </HelpSection>

      <HelpSection
        title="Understanding the User List"
        icon={<ArrowUpDown className="h-5 w-5" />}
      >
        <p className="text-muted-foreground mb-3">
          The user list shows important information about each user:
        </p>

        <div className="bg-muted/50 rounded p-3">
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li>
              <strong>Name</strong> - The user&apos;s display name
            </li>
            <li>
              <strong>Email</strong> - Their email address (used for login)
            </li>
            <li>
              <strong>Role</strong> - Color-coded badges showing their
              permissions
            </li>
            <li>
              <strong>Created</strong> - When the account was created
            </li>
            <li>
              <strong>Actions</strong> - Menu to edit or delete the user
            </li>
          </ul>
        </div>

        <div className="mt-3">
          <p className="font-medium mb-2">To sort the list:</p>
          <p className="text-muted-foreground text-xs">
            Click any column header (<strong>Name</strong>,{" "}
            <strong>Email</strong>, or <strong>Created</strong>) to sort by that
            column. Click again to reverse the order.
          </p>
        </div>
      </HelpSection>

      <HelpSection
        title="Understanding Roles"
        icon={<Shield className="h-5 w-5" />}
      >
        <p className="text-muted-foreground mb-3">
          Roles determine what a user can do in the system:
        </p>

        <div className="space-y-3">
          <div className="border-l-2 border-purple-400 pl-3">
            <p className="font-medium mb-1">Platform Admin</p>
            <p className="text-muted-foreground text-xs">
              Full platform access. Can manage all organizations, users, and
              system settings across the entire platform.
            </p>
          </div>

          <div className="border-l-2 border-red-400 pl-3">
            <p className="font-medium mb-1">Owner</p>
            <p className="text-muted-foreground text-xs">
              Full access within their organization. Can manage members,
              settings, and all data.
            </p>
          </div>

          <div className="border-l-2 border-blue-400 pl-3">
            <p className="font-medium mb-1">Admin</p>
            <p className="text-muted-foreground text-xs">
              Can manage users, create projects, and configure settings within
              their organization.
            </p>
          </div>

          <div className="border-l-2 border-gray-400 pl-3">
            <p className="font-medium mb-1">Member</p>
            <p className="text-muted-foreground text-xs">
              Can view and work on projects, resources, and other data they
              have access to.
            </p>
          </div>

          <div className="border-l-2 border-yellow-400 pl-3">
            <p className="font-medium mb-1">Viewer</p>
            <p className="text-muted-foreground text-xs">
              Read-only access. Can view data but cannot create or modify
              anything.
            </p>
          </div>

          <div className="border-l-2 border-green-400 pl-3">
            <p className="font-medium mb-1">Accountant</p>
            <p className="text-muted-foreground text-xs">
              Access to financial data including invoices, payments, and
              reports.
            </p>
          </div>
        </div>
      </HelpSection>

      <HelpSection
        title="Creating a New User"
        icon={<UserPlus className="h-5 w-5" />}
      >
        <p className="text-muted-foreground mb-3">
          To add a new user to your organization:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-xs">
          <li>
            Click the <strong>&quot;Create User&quot;</strong> button (or press{" "}
            <Kbd>N</Kbd>)
          </li>
          <li>
            Enter the user&apos;s <strong>email address</strong>
          </li>
          <li>
            Enter their <strong>name</strong>
          </li>
          <li>
            Optionally add a <strong>description</strong>
          </li>
          <li>
            Select one or more <strong>roles</strong>
          </li>
          <li>
            Check <strong>&quot;Send invitation email&quot;</strong> if you want
            them to receive a welcome email
          </li>
          <li>
            Click <strong>&quot;Create User&quot;</strong>
          </li>
        </ol>

        <div className="bg-muted/50 rounded p-3 mt-3">
          <p className="text-xs">
            <strong>Tip:</strong> The invitation email contains a link for the
            user to set up their account and log in.
          </p>
        </div>
      </HelpSection>

      {/* 6. Editing Users */}
      <HelpSection title="Editing a User" icon={<Edit className="h-5 w-5" />}>
        <p className="text-muted-foreground mb-3">
          To modify an existing user&apos;s information:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-xs">
          <li>Find the user in the list</li>
          <li>
            Click the <strong>three-dot menu</strong> (⋮) in their row
          </li>
          <li>
            Select <strong>&quot;Edit&quot;</strong>
          </li>
          <li>Make your changes</li>
          <li>
            Click <strong>&quot;Save Changes&quot;</strong>
          </li>
        </ol>

        <div className="mt-3">
          <p className="font-medium mb-2">Keyboard shortcut:</p>
          <p className="text-muted-foreground text-xs">
            Use <Kbd>J</Kbd>/<Kbd>K</Kbd> to select a user, then press{" "}
            <Kbd>Enter</Kbd> to edit them.
          </p>
        </div>
      </HelpSection>

      <HelpSection
        title="Deleting a User"
        icon={<Trash2 className="h-5 w-5" />}
      >
        <p className="text-muted-foreground mb-3">
          To remove a user from your organization:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-xs">
          <li>Find the user in the list</li>
          <li>
            Click the <strong>three-dot menu</strong> (⋮) in their row
          </li>
          <li>
            Select <strong>&quot;Delete&quot;</strong>
          </li>
          <li>Confirm the deletion in the dialog</li>
        </ol>

        <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
          <p className="text-xs text-red-800">
            <strong>Warning:</strong> Deleting a user is permanent and cannot be
            undone. All their data and access will be removed.
          </p>
        </div>

        <div className="mt-3">
          <p className="font-medium mb-2">Keyboard shortcut:</p>
          <p className="text-muted-foreground text-xs">
            Select a user with <Kbd>J</Kbd>/<Kbd>K</Kbd>, then press{" "}
            <Kbd>Backspace</Kbd> to delete.
          </p>
        </div>
      </HelpSection>

      <HelpSection
        title="Keyboard Shortcuts"
        icon={<Keyboard className="h-5 w-5" />}
      >
        <p className="text-muted-foreground mb-3">
          Use these shortcuts to work faster:
        </p>

        <div className="bg-muted/50 rounded p-3">
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li className="flex justify-between items-center">
              <span>Create new user</span>
              <Kbd>N</Kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Refresh user list</span>
              <Kbd>R</Kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Select next user</span>
              <Kbd>J</Kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Select previous user</span>
              <Kbd>K</Kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Edit selected user</span>
              <Kbd>Enter</Kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Delete selected user</span>
              <Kbd>Backspace</Kbd>
            </li>
            <li className="flex justify-between items-center">
              <span>Show all shortcuts</span>
              <span>
                <Kbd>Ctrl</Kbd>+<Kbd>/</Kbd> / <Kbd>⌘</Kbd>+<Kbd>/</Kbd>
              </span>
            </li>
          </ul>
        </div>
      </HelpSection>

      <HelpSection
        title="Common Questions"
        icon={<HelpCircle className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div>
            <p className="font-medium text-foreground">
              I can&apos;t access User Management
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              You need Admin permissions to manage users. Contact your
              administrator if you need access.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">
              I don&apos;t see the Platform Admin role option
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              The Platform Admin role is only available to existing platform
              administrators. Organization owners and admins can assign
              other roles within their organization.
            </p>
          </div>

          <div>
            <p className="font-medium text-foreground">
              The user didn&apos;t receive their invitation email
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-xs mt-1 space-y-1">
              <li>Check that the email address is correct</li>
              <li>Ask them to check their spam/junk folder</li>
              <li>You can edit the user and resend the invitation</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-foreground">
              Can I restore a deleted user?
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              No, deleted users cannot be restored. You would need to create a
              new user with the same email address.
            </p>
          </div>
        </div>
      </HelpSection>
    </>
  );
}

export const usersHelpMeta = {
  title: "User Management Help",
  description: "Learn how to manage users and their roles.",
};
