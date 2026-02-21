/**
 * Timezone formatting utilities
 *
 * These utilities format dates according to the user's timezone preference.
 * Use these functions throughout the app instead of direct Date formatting
 * to ensure consistent timezone handling.
 */

export interface FormatDateOptions {
  timezone?: string;
  includeTime?: boolean;
  includeSeconds?: boolean;
  includeTimezone?: boolean;
}

const INVALID_DATE_STRING = "Invalid date";

/**
 * Format a date/timestamp to a localized string in the specified timezone
 */
export function formatDate(
  date: Date | string | number,
  options: FormatDateOptions = {}
): string {
  const {
    timezone,
    includeTime = true,
    includeSeconds = false,
    includeTimezone = false,
  } = options;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return INVALID_DATE_STRING;
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(timezone && { timeZone: timezone }),
  };

  if (includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
    if (includeSeconds) {
      formatOptions.second = "2-digit";
    }
  }

  if (includeTimezone) {
    formatOptions.timeZoneName = "short";
  }

  return dateObj.toLocaleString("en-US", formatOptions);
}

/**
 * Format a date to show only the time portion
 */
export function formatTime(
  date: Date | string | number,
  options: { timezone?: string; includeSeconds?: boolean } = {}
): string {
  const { timezone, includeSeconds = false } = options;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid time";
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds && { second: "2-digit" }),
    ...(timezone && { timeZone: timezone }),
  };

  return dateObj.toLocaleTimeString("en-US", formatOptions);
}

/**
 * Format a date to ISO string in the specified timezone
 * Useful for displaying timestamps in a standard format
 */
export function formatISOInTimezone(
  date: Date | string | number,
  timezone?: string
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return INVALID_DATE_STRING;
  }

  // Get the date parts in the target timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...(timezone && { timeZone: timezone }),
  });

  const parts = formatter.formatToParts(dateObj);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value || "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get(
    "minute"
  )}:${get("second")}`;
}

/**
 * Format a relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  baseDate: Date = new Date()
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return INVALID_DATE_STRING;
  }

  const diffMs = dateObj.getTime() - baseDate.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffSec) < 60) {
    return rtf.format(diffSec, "second");
  } else if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, "minute");
  } else if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, "hour");
  } else {
    return rtf.format(diffDay, "day");
  }
}

/**
 * Get the current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone?: string): Date {
  const now = new Date();
  if (!timezone) return now;

  return now;
}

/**
 * Get timezone offset string (e.g., "GMT-5", "GMT+2")
 */
export function getTimezoneOffset(timezone?: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "shortOffset",
    ...(timezone && { timeZone: timezone }),
  });

  const parts = formatter.formatToParts(new Date());
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  return offsetPart?.value || "";
}

/**
 * Get a friendly timezone name (e.g., "Eastern Standard Time")
 */
export function getTimezoneName(timezone?: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "long",
    ...(timezone && { timeZone: timezone }),
  });

  const parts = formatter.formatToParts(new Date());
  const namePart = parts.find((p) => p.type === "timeZoneName");
  return namePart?.value || timezone || "";
}

/**
 * Convert a local datetime string (from datetime-local input) to UTC ISO string.
 *
 * The datetime-local input returns strings like "2024-01-23T10:00" without timezone info.
 * This function interprets that time as being in the specified timezone and converts to UTC.
 *
 * @param localDateTimeString - A string from datetime-local input (e.g., "2024-01-23T10:00")
 * @param timezone - The timezone to interpret the local time in (e.g., "America/New_York")
 * @returns UTC ISO string suitable for API requests, or empty string if input is empty/invalid
 */
export function localDateTimeToUTC(
  localDateTimeString: string,
  timezone?: string
): string {
  if (!localDateTimeString) return "";

  // Parse the local datetime string components
  const match = localDateTimeString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!match) return "";

  const [, year, month, day, hour, minute, second = "00"] = match;

  // Create a formatter that will give us the UTC offset for the target timezone at this specific date/time
  // We need to find what UTC time corresponds to this local time in the given timezone
  const targetTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Create a date assuming UTC first, then adjust
  // We'll use an iterative approach: create a UTC date, check what it looks like in the target timezone,
  // and adjust until we find the right UTC time
  const targetYear = parseInt(year, 10);
  const targetMonth = parseInt(month, 10) - 1; // JS months are 0-indexed
  const targetDay = parseInt(day, 10);
  const targetHour = parseInt(hour, 10);
  const targetMinute = parseInt(minute, 10);
  const targetSecond = parseInt(second, 10);

  // Start with a guess: create a UTC date with the same numbers
  let utcDate = new Date(
    Date.UTC(targetYear, targetMonth, targetDay, targetHour, targetMinute, targetSecond)
  );

  // Get the parts of this UTC date when viewed in the target timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: targetTimezone,
  });

  // Check what our guess looks like in the target timezone
  const getParts = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
      hour: get("hour"),
      minute: get("minute"),
      second: get("second"),
    };
  };

  const localParts = getParts(utcDate);

  // Calculate the difference and adjust
  // The difference tells us the offset from UTC for this timezone at this time
  const localMs = new Date(
    localParts.year,
    localParts.month - 1,
    localParts.day,
    localParts.hour,
    localParts.minute,
    localParts.second
  ).getTime();
  const targetMs = new Date(
    targetYear,
    targetMonth,
    targetDay,
    targetHour,
    targetMinute,
    targetSecond
  ).getTime();

  const offsetMs = localMs - targetMs;

  // Adjust our UTC date by the offset
  utcDate = new Date(utcDate.getTime() - offsetMs);

  return utcDate.toISOString();
}

/**
 * Convert a UTC ISO string to a local datetime string for datetime-local input.
 *
 * This is the inverse of localDateTimeToUTC. It takes a UTC timestamp and converts
 * it to the format expected by datetime-local input in the specified timezone.
 *
 * @param utcISOString - A UTC ISO string (e.g., "2024-01-23T09:00:00.000Z")
 * @param timezone - The timezone to display the time in (e.g., "America/New_York")
 * @returns Local datetime string for datetime-local input (e.g., "2024-01-23T10:00"), or empty string if invalid
 */
export function utcToLocalDateTime(
  utcISOString: string,
  timezone?: string
): string {
  if (!utcISOString) return "";

  const date = new Date(utcISOString);
  if (isNaN(date.getTime())) return "";

  const targetTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Format the UTC date in the target timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: targetTimezone,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";

  // Return in datetime-local format: YYYY-MM-DDTHH:MM
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
