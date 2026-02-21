"use client";

import { useCallback } from "react";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import {
  formatDate,
  formatTime,
  formatISOInTimezone,
  formatRelativeTime,
  getTimezoneOffset,
  getTimezoneName,
  localDateTimeToUTC,
  utcToLocalDateTime,
  type FormatDateOptions,
} from "@/lib/timezone";

/**
 * Hook that provides timezone-aware date formatting functions
 * using the user's timezone preference.
 *
 * Usage:
 * ```tsx
 * const { formatDateTime, formatTimeOnly, timezone } = useTimezoneFormat();
 *
 * // Format a date with user's timezone preference
 * <span>{formatDateTime(event.timestamp)}</span>
 * ```
 */
export function useTimezoneFormat() {
  const { getEffectiveTimezone, timezonePreferences } = useUserPreferences();

  const timezone = getEffectiveTimezone();

  const formatDateTime = useCallback(
    (
      date: Date | string | number,
      options: Omit<FormatDateOptions, "timezone"> = {}
    ) => {
      return formatDate(date, { ...options, timezone });
    },
    [timezone]
  );

  const formatDateOnly = useCallback(
    (date: Date | string | number) => {
      return formatDate(date, { timezone, includeTime: false });
    },
    [timezone]
  );

  const formatTimeOnly = useCallback(
    (
      date: Date | string | number,
      options: { includeSeconds?: boolean } = {}
    ) => {
      return formatTime(date, { ...options, timezone });
    },
    [timezone]
  );

  const formatISO = useCallback(
    (date: Date | string | number) => {
      return formatISOInTimezone(date, timezone);
    },
    [timezone]
  );

  const formatRelative = useCallback(
    (date: Date | string | number, baseDate?: Date) => {
      return formatRelativeTime(date, baseDate);
    },
    []
  );

  const getOffset = useCallback(() => {
    return getTimezoneOffset(timezone);
  }, [timezone]);

  const getName = useCallback(() => {
    return getTimezoneName(timezone);
  }, [timezone]);

  /**
   * Convert a local datetime string (from datetime-local input) to UTC ISO string.
   * Use this before sending timestamps to the API.
   */
  const toUTC = useCallback(
    (localDateTimeString: string): string => {
      return localDateTimeToUTC(localDateTimeString, timezone);
    },
    [timezone]
  );

  /**
   * Convert a UTC ISO string to a local datetime string for datetime-local input.
   * Use this when loading saved timestamps for display in the filter UI.
   */
  const fromUTC = useCallback(
    (utcISOString: string): string => {
      return utcToLocalDateTime(utcISOString, timezone);
    },
    [timezone]
  );

  return {
    // Current effective timezone
    timezone,

    // Whether custom timezone is enabled
    isCustomTimezone: timezonePreferences.enabled,

    // Formatting functions
    formatDateTime,
    formatDateOnly,
    formatTimeOnly,
    formatISO,
    formatRelative,

    // Timezone info
    getOffset,
    getName,

    // Timezone conversion (for API requests and storage)
    toUTC,
    fromUTC,
  };
}
