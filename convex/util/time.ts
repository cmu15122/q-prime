import { DateTime } from 'luxon';

/**
 * Returns the start and end timestamps (ms) for the "current day" in the given timezone.
 */
export function getZoneDayBounds(
  nowMs: number = Date.now(),
  timezone: string = 'UTC'
) {
  const dt = DateTime.fromMillis(nowMs).setZone(timezone);
  return {
    startMs: dt.startOf('day').toMillis(),
    endMs: dt.endOf('day').toMillis(),
  };
}

/**
 * Returns the YYYY-MM-DD string key for a given timestamp in the timezone.
 */
export function getZoneDayKey(timeMs: number, timezone: string = 'UTC') {
  return DateTime.fromMillis(timeMs).setZone(timezone).toISODate()!;
}

/**
 * Returns the day of week index (0=Sunday ... 6=Saturday) in the timezone.
 * Matches JS Date.getDay() behavior but timezone-aware.
 */
export function getZoneDayOfWeek(
  timeMs: number,
  timezone: string = 'UTC'
): number {
  const dt = DateTime.fromMillis(timeMs).setZone(timezone);
  // Luxon uses 1=Monday...7=Sunday. Convert to 0=Sunday...6=Saturday to match existing code.
  return dt.weekday === 7 ? 0 : dt.weekday;
}
