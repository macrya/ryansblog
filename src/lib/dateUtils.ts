/**
 * Accurate Date Handling & Formatting Utilities for MarkRyan Blog CMS
 *
 * Designed for Next.js App Router and React with native Intl.DateTimeFormat
 * to standardize timestamps and prevent hydration mismatches across server and client.
 */

export interface DateFormatOptions {
  /** Include time in formatting (e.g. "September 14, 2026 · 02:14 AM") */
  includeTime?: boolean;
  /** 12-hour or 24-hour clock */
  hourCycle?: 'h12' | 'h23';
  /** Timezone (defaults to UTC for SSR stability or user's local timezone) */
  timeZone?: string;
  /** Specific locale (defaults to 'en-US') */
  locale?: string;
}

/**
 * Safely parses any date input (ISO string, Date object, Unix timestamp, or human string)
 * into a valid Date object. Returns null if invalid.
 */
export function parseDateSafe(input: string | Date | number | null | undefined): Date | null {
  if (!input) return null;

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Try standard ISO parsing
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Try parsing common human formats like "September 14, 2026"
    const parsedTimestamp = Date.parse(trimmed);
    if (!isNaN(parsedTimestamp)) {
      return new Date(parsedTimestamp);
    }
  }

  return null;
}

/**
 * Standardizes any date input to an ISO 8601 string for HTML5 <time dateTime="...">
 */
export function toISODateString(input: string | Date | number | null | undefined): string {
  const date = parseDateSafe(input);
  if (!date) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

/**
 * Formats a timestamp into the classic "Diary Page" literary aesthetic.
 * Example output: "September 14, 2026"
 *
 * Uses native Intl.DateTimeFormat with explicit options to ensure deterministic
 * formatting that prevents server-client hydration mismatches.
 */
export function formatDiaryDate(
  input: string | Date | number | null | undefined,
  options: DateFormatOptions = {}
): string {
  const date = parseDateSafe(input);
  if (!date) {
    return typeof input === 'string' && input.length > 0 ? input : 'Undated Entry';
  }

  const locale = options.locale || 'en-US';

  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: options.timeZone,
  });

  return formatter.format(date);
}

/**
 * Formats a timestamp with both date and time for blog entries and correspondence logs.
 * Example output: "September 14, 2026 · 02:14 AM"
 */
export function formatDiaryTimestamp(
  input: string | Date | number | null | undefined,
  explicitTime?: string,
  options: DateFormatOptions = {}
): string {
  const date = parseDateSafe(input);
  const formattedDate = formatDiaryDate(input, options);

  if (explicitTime) {
    return `${formattedDate} · ${explicitTime}`;
  }

  if (!date) {
    return formattedDate;
  }

  const locale = options.locale || 'en-US';
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: options.hourCycle !== 'h23',
    timeZone: options.timeZone,
  });

  const formattedTime = timeFormatter.format(date);
  return `${formattedDate} · ${formattedTime}`;
}

/**
 * Returns a relative, human-readable date (e.g. "Just now", "3 hours ago", "Yesterday", "4 days ago")
 * with a fallback to full date format for older entries.
 */
export function formatRelativeDate(
  input: string | Date | number | null | undefined,
  locale = 'en-US'
): string {
  const date = parseDateSafe(input);
  if (!date) return 'Recently';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  // Fallback to classic literary date
  return formatDiaryDate(date, { locale });
}
