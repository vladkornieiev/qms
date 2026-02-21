const PAGE_NAME_PATTERNS: [RegExp, string][] = [
  [/^\/dashboard$/, "Dashboard"],
  [/^\/clients$/, "Clients"],
  [/^\/clients\/[^/]+$/, "Client Detail"],
  [/^\/vendors$/, "Vendors"],
  [/^\/vendors\/[^/]+$/, "Vendor Detail"],
  [/^\/products$/, "Products"],
  [/^\/products\/[^/]+$/, "Product Detail"],
  [/^\/inventory$/, "Inventory"],
  [/^\/inventory\/[^/]+$/, "Item Detail"],
  [/^\/resources$/, "Resources"],
  [/^\/resources\/[^/]+$/, "Resource Detail"],
  [/^\/projects$/, "Projects"],
  [/^\/projects\/[^/]+$/, "Project Detail"],
  [/^\/pipeline$/, "Pipeline"],
  [/^\/pipeline\/[^/]+$/, "Request Detail"],
  [/^\/quotes$/, "Quotes"],
  [/^\/quotes\/[^/]+$/, "Quote Detail"],
  [/^\/invoices$/, "Invoices"],
  [/^\/invoices\/[^/]+$/, "Invoice Detail"],
  [/^\/payments$/, "Payments"],
  [/^\/contracts$/, "Contracts"],
  [/^\/contracts\/[^/]+$/, "Contract Detail"],
  [/^\/templates$/, "Templates"],
  [/^\/templates\/[^/]+$/, "Template Detail"],
  [/^\/payouts$/, "Payouts"],
  [/^\/reports$/, "Reports"],
  [/^\/notifications$/, "Notifications"],
  [/^\/users$/, "Users"],
  [/^\/admin\/users$/, "Admin Users"],
  [/^\/admin\/accounts$/, "Admin Organizations"],
  [/^\/admin\/tags$/, "Tags"],
  [/^\/admin\/lookup-lists$/, "Lookup Lists"],
  [/^\/admin\/custom-fields$/, "Custom Fields"],
  [/^\/admin\/categories$/, "Categories"],
  [/^\/admin\/automations$/, "Automations"],
  [/^\/admin\/integrations$/, "Integrations"],
  [/^\/profile$/, "Profile"],
  [/^\/profile\/security$/, "Profile Security"],
  [/^\/settings/, "Settings"],
  [/^\/onboarding$/, "Onboarding"],
];

export function getPageName(path: string): string {
  for (const [pattern, name] of PAGE_NAME_PATTERNS) {
    if (pattern.test(path)) {
      return name;
    }
  }
  // Fallback: convert path to title case
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";
  return segments
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .join(" - ");
}
