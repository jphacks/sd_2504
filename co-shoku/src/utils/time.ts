const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const JST_OFFSET_MS = 9 * HOUR_IN_MS;

export const now = (): Date => new Date();

export const toIsoString = (date: Date): string => date.toISOString();

export const addHours = (date: Date, hours: number): Date => new Date(date.getTime() + hours * HOUR_IN_MS);

export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY_IN_MS);

export const isAfterNow = (isoDate?: string | null): boolean => {
  if (!isoDate) {
    return false;
  }
  return new Date(isoDate).getTime() > Date.now();
};

export const minutesUntil = (isoDate?: string | null): number => {
  if (!isoDate) {
    return 0;
  }
  const diff = new Date(isoDate).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / (60 * 1000)) : 0;
};

export const getNextResetTimestampJst = (reference: Date = now()): number => {
  const utcMillis = reference.getTime();
  const jstMillis = utcMillis + JST_OFFSET_MS;
  const jstDate = new Date(jstMillis);
  const reset = new Date(jstMillis);
  if (jstDate.getHours() >= 2) {
    reset.setDate(reset.getDate() + 1);
  }
  reset.setHours(2, 0, 0, 0);
  return reset.getTime() - JST_OFFSET_MS;
};

export const shouldResetDailyCount = (nextResetAt?: string | null, reference: Date = now()): boolean => {
  if (!nextResetAt) {
    return true;
  }
  return reference.getTime() >= new Date(nextResetAt).getTime();
};

export const formatDateShort = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const withinLastDays = (isoDate: string, days: number, reference: Date = now()): boolean => {
  const from = addDays(reference, -days);
  return new Date(isoDate).getTime() >= from.getTime();
};

export const getHoursUntil = (isoDate?: string | null): number => {
  if (!isoDate) {
    return 0;
  }
  const diff = new Date(isoDate).getTime() - Date.now();
  return diff > 0 ? diff / HOUR_IN_MS : 0;
};

