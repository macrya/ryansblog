'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import {
  formatDiaryDate,
  formatDiaryTimestamp,
  formatRelativeDate,
  toISODateString,
  type DateFormatOptions,
} from '../lib/dateUtils';

export interface DateDisplayProps {
  /** The timestamp as an ISO string, Date object, Unix timestamp, or human string */
  date: string | Date | number | null | undefined;
  /** Optional explicit time string (e.g., "02:14 AM") */
  time?: string;
  /** Format style: 'diary' (default: "September 14, 2026"), 'withTime', 'relative', or 'short' */
  format?: 'diary' | 'withTime' | 'relative' | 'short';
  /** Optional CSS classes for the container/time element */
  className?: string;
  /** Whether to show a decorative metadata icon */
  showIcon?: boolean;
  /** CSS class for the icon */
  iconClassName?: string;
  /** Optional formatting configuration */
  options?: DateFormatOptions;
}

/**
 * Hydration-Safe Date Display Component for Next.js App Router & React
 *
 * Renders semantic <time dateTime="..."> with suppressHydrationWarning
 * to eliminate hydration mismatches between SSR and client timezone renderings.
 */
export function DateDisplay({
  date,
  time,
  format = 'diary',
  className = '',
  showIcon = false,
  iconClassName = 'w-3 h-3 text-stone-400',
  options,
}: DateDisplayProps) {
  // ISO string for HTML5 semantic SEO
  const isoDateTime = toISODateString(date);

  // Client-mounted tracking to ensure relative dates or user locale updates
  // do not trigger hydration divergence on the very first frame
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute formatted text safely
  const formattedText = (() => {
    if (format === 'relative' && isMounted) {
      return formatRelativeDate(date, options?.locale);
    }

    if (format === 'withTime' || time) {
      return formatDiaryTimestamp(date, time, options);
    }

    if (format === 'short') {
      const parsed = formatDiaryDate(date, options);
      return parsed.replace(/, \d{4}/, ''); // e.g. "September 14"
    }

    // Default 'diary' aesthetic
    return formatDiaryDate(date, options);
  })();

  const IconComponent = format === 'withTime' || time ? Clock : Calendar;

  return (
    <time
      dateTime={isoDateTime}
      suppressHydrationWarning
      className={`inline-flex items-center gap-1.5 font-cormorant tracking-tight text-stone-600 ${className}`}
      title={isoDateTime}
    >
      {showIcon && <IconComponent className={iconClassName} aria-hidden="true" />}
      <span>{formattedText}</span>
    </time>
  );
}

export default DateDisplay;
