const PAGE_NAME_PATTERNS: [RegExp, string][] = [
  [/^\/users$/, "Users"],
  [/^\/admin\/users$/, "Admin Users"],
  [/^\/admin\/accounts$/, "Admin Organizations"],
  [/^\/profile$/, "Profile"],
  [/^\/profile\/security$/, "Profile Security"],
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
