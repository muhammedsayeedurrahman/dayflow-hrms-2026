import { format } from 'date-fns';

export const formatTimeStr = (isoString: string | null | undefined): string | null => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return null;
  return format(date, 'hh:mm a'); // e.g. "09:30 AM"
};

export const formatDateStr = (isoString: string | Date | null | undefined): string => {
  if (!isoString) return '';
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (isoString: string | Date | null | undefined): string => {
  if (!isoString) return '';
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  if (isNaN(date.getTime())) return '';
  return format(date, 'MMM dd, yyyy'); // e.g. "Aug 22, 2026"
};
