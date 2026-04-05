import { Timestamp } from 'firebase/firestore';

/**
 * Normalize a JS Date or Firestore Timestamp to a YYYY-MM-DD string
 * in the user's local timezone.
 */
export function toDateKey(dateOrTimestamp) {
  let d;
  if (!dateOrTimestamp) return null;
  
  if (dateOrTimestamp instanceof Timestamp) {
    d = dateOrTimestamp.toDate();
  } else if (dateOrTimestamp instanceof Date) {
    d = dateOrTimestamp;
  } else if (typeof dateOrTimestamp === 'number' || typeof dateOrTimestamp === 'string') {
    d = new Date(dateOrTimestamp);
  } else {
    return null;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get today's date key in the user's local timezone.
 */
export function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get yesterday's date key in the user's local timezone.
 */
export function yesterdayKey() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
