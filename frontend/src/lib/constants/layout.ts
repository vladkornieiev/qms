/**
 * Layout constants for consistent spacing and dimensions across the application
 */
export const LAYOUT_CONSTANTS = {
  SIDEBAR_WIDTH_EXPANDED: 'w-64',
  SIDEBAR_WIDTH_COLLAPSED: 'w-16',
  MARGIN_LEFT_EXPANDED: 'ml-64',
  MARGIN_LEFT_COLLAPSED: 'ml-16',
  TOP_NAV_HEIGHT: 'h-16',
  TOP_NAV_PADDING: 'pt-16',
  TRANSITION_DURATION: 'duration-300',
  MOBILE_BREAKPOINT: 768, // pixels
} as const;

/**
 * Numeric values for programmatic access
 */
export const LAYOUT_VALUES = {
  SIDEBAR_WIDTH_EXPANDED_PX: 256,
  SIDEBAR_WIDTH_COLLAPSED_PX: 64,
  TOP_NAV_HEIGHT_PX: 64,
  MOBILE_BREAKPOINT_PX: 768,
} as const;
