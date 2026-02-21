const PAGE_NAME_PATTERNS: [RegExp, string][] = [
  [/^\/dashboard$/, "Dashboard"],
  [/^\/projects$/, "Projects"],
  [/^\/projects\/[^/]+$/, "Project Detail"],
  [/^\/projects\/[^/]+\/monitor/, "Project Monitor"],
  [/^\/projects\/[^/]+\/alerts/, "Project Alerts"],
  [/^\/projects\/[^/]+\/settings/, "Project Settings"],
  [/^\/users$/, "Users"],
  [/^\/data-sources$/, "Data Sources"],
  [/^\/admin\/users$/, "Admin Users"],
  [/^\/admin\/accounts$/, "Admin Accounts"],
  [/^\/admin\/projects$/, "Admin Projects"],
  [/^\/admin\/analytics$/, "Admin Analytics"],
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
