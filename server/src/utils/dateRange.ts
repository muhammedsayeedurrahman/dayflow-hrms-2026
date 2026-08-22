import { HttpError } from '../middleware/errorHandler';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDateOnly = (value: unknown, boundary: 'start' | 'end'): Date => {
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) {
    throw new HttpError(400, 'Dates must use the YYYY-MM-DD format');
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date.UTC normalizes invalid calendar values (for example, 2026-02-30), so
  // compare every part to ensure the requested date actually exists.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new HttpError(400, 'Invalid date');
  }

  if (boundary === 'end') {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
};

/**
 * Builds an inclusive UTC date range for date-only API filters. Attendance
 * records are stored as calendar-day values, so this avoids excluding records
 * from the requested end date.
 */
export const getInclusiveDateRange = (
  startDate: unknown,
  endDate: unknown,
  defaultDays?: number
): { start?: Date; end?: Date } => {
  let start = startDate === undefined ? undefined : parseDateOnly(startDate, 'start');
  let end = endDate === undefined ? undefined : parseDateOnly(endDate, 'end');

  if (!start && !end && defaultDays !== undefined) {
    end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (defaultDays - 1));
    start.setUTCHours(0, 0, 0, 0);
  }

  if (start && end && start > end) {
    throw new HttpError(400, 'startDate must be on or before endDate');
  }

  return { start, end };
};
