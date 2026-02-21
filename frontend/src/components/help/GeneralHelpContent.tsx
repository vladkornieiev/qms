"use client";

import React from "react";
import { HelpCircle, BookOpen, Mail } from "lucide-react";

export function GeneralHelpContent() {
  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-lg mb-2">No specific help available</h3>
        <p className="text-muted-foreground text-sm">
          There is no specific help guide for this page yet.
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <span className="font-medium">Need assistance?</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          If you need help with this page, please contact your system
          administrator.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Contact support for assistance</span>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <p className="font-medium mb-2">Key sections:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • <strong>Dashboard</strong> - Revenue, pipeline, and utilization overview
          </li>
          <li>
            • <strong>Projects</strong> - Manage projects, resources, and products
          </li>
          <li>
            • <strong>Quotes & Invoices</strong> - Create quotes and track payments
          </li>
          <li>
            • <strong>Resources</strong> - Schedule and manage team members
          </li>
          <li>
            • <strong>Inventory</strong> - Track products and stock levels
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          Navigate to these pages and click the Help button to see the relevant
          guide.
        </p>
      </div>
    </div>
  );
}

export const generalHelpMeta = {
  title: "Help",
  description: "Get help and support for using the platform.",
};
