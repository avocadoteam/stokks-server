import { NotificationIntervalTarget } from '@models';

export const convertNI = (interval: NotificationIntervalTarget | object) => {
  if (typeof interval !== 'object') return interval;

  const { hours, days, months } = interval as { months: number; days: number; hours: number };
  if (hours === 1) return NotificationIntervalTarget.EveryHour;
  if (hours === 8) return NotificationIntervalTarget.Every8Hours;
  if (days === 1) return NotificationIntervalTarget.Daily;
  if (days === 7) return NotificationIntervalTarget.Weekly;
  if (months === 1) return NotificationIntervalTarget.Monthly;

  return NotificationIntervalTarget.EveryHour;
};
