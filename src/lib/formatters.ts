import type { Deal } from '../types/deal';
import type { DealInsight } from './types';

export function cleanText(value: string) {
  return value.replace(/[\u2014\u2013]/g, '-');
}

export function dateFromYmd(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`);
}

export function daysBetween(fromYmd: string, toYmd: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((dateFromYmd(toYmd).getTime() - dateFromYmd(fromYmd).getTime()) / msPerDay);
}

export function formatDate(ymd?: string) {
  if (!ymd) return 'No date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromYmd(ymd));
}

export function formatAmount(deal: Deal) {
  if (deal.amount == null) return 'Amount missing';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: deal.currency,
    maximumFractionDigits: 0,
  }).format(deal.amount);
}

export function formatPipelineTotal(openDeals: DealInsight[]) {
  const totals = openDeals.reduce<Record<string, number>>((acc, deal) => {
    if (deal.amount == null) return acc;
    acc[deal.currency] = (acc[deal.currency] ?? 0) + deal.amount;
    return acc;
  }, {});

  const entries = Object.entries(totals);
  if (entries.length === 0) return '$0';

  return entries
    .sort(([a], [b]) => (a === 'USD' ? -1 : b === 'USD' ? 1 : a.localeCompare(b)))
    .map(([currency, total]) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        notation: total >= 10_000 ? 'compact' : 'standard',
        maximumFractionDigits: total >= 10_000 ? 1 : 0,
      }).format(total),
    )
    .join(' + ');
}

export function closeLabel(daysToClose: number | null, expectedCloseDate?: string) {
  if (daysToClose == null || !expectedCloseDate) return 'Close date missing';
  if (daysToClose < 0) return `${Math.abs(daysToClose)}d overdue`;
  if (daysToClose === 0) return 'Closes today';
  if (daysToClose === 1) return 'Closes tomorrow';
  return `Closes in ${daysToClose}d`;
}

export function activityLabel(daysSinceActivity: number | null) {
  if (daysSinceActivity == null) return 'No activity';
  if (daysSinceActivity === 0) return 'Today';
  if (daysSinceActivity === 1) return '1d ago';
  return `${daysSinceActivity}d ago`;
}
