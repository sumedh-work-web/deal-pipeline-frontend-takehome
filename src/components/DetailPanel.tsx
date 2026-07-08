import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Inbox,
  UserRound,
} from 'lucide-react';
import { cleanText, formatDate } from '../lib/formatters';
import { Badge } from './Badge';
import { MetaItem } from './MetaItem';
import { EmptyState } from './EmptyState';
import type { DealInsight } from '../lib/types';

interface DetailPanelProps {
  deal: DealInsight | null;
  isPipelineEmpty?: boolean;
}

export function DetailPanel({
  deal,
  isPipelineEmpty = false,
}: DetailPanelProps) {
  if (!deal) {
    return (
      <aside className="h-full rounded-lg border border-dashed border-slate-300 bg-white">
        <EmptyState
          icon={Inbox}
          title={isPipelineEmpty ? 'No active deals' : 'No deal selected'}
          subtitle={
            isPipelineEmpty
              ? 'Sync new deals in your CRM to begin prioritizing your morning actions.'
              : 'Click a deal in the queue to inspect the recommended move, signals, and latest note.'
          }
        />
      </aside>
    );
  }

  const note = cleanText(deal.lastActivity?.note ?? 'No activity has been recorded for this deal.');

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div key={deal.id} className="flex min-h-0 flex-1 flex-col motion-safe:animate-fadeIn">
        <div className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-white to-primarySoft/35 px-4 py-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-wrap gap-1">
              <Badge tone={deal.priorityTier === 'today' ? 'moss' : deal.priorityTier === 'risk' ? 'amber' : 'slate'}>
                {deal.stageLabel}
              </Badge>
              <Badge tone={deal.confidence === 'High' ? 'green' : deal.confidence === 'Medium' ? 'amber' : 'red'}>
                {deal.confidence} confidence
              </Badge>
            </div>
            <div className="shrink-0 text-right text-[10px] font-medium text-slate-500 leading-4">
              <div>Created: <span className="font-semibold text-ink">{formatDate(deal.createdDate)}</span></div>
              <div>Owner: <span className="font-semibold text-ink">{deal.owner}</span></div>
            </div>
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-ink">{deal.company}</h2>
          <p className="mt-0.5 text-sm text-stone-600">
            {deal.contactName ?? 'No contact'}
            {deal.contactTitle ? `, ${deal.contactTitle}` : ''}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-4 [scrollbar-gutter:stable]">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-blue-100 bg-primarySoft text-primary">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-primary">Recommended move</p>
              <p className="mt-0.5 text-base font-semibold text-ink leading-5">{deal.action}</p>
              <p className="mt-0.5 text-xs leading-4 text-slate-600">{deal.actionDetail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetaItem icon={CircleDollarSign} label="Amount" tone="moss" value={deal.amountLabel} />
            <MetaItem
              icon={CalendarClock}
              label="Close"
              tone={deal.daysToClose != null && deal.daysToClose <= 1 ? 'red' : 'primary'}
              value={deal.closeLabel}
            />
            <MetaItem
              icon={Clock3}
              label="Activity"
              tone={deal.daysSinceActivity == null || deal.daysSinceActivity >= 14 ? 'amber' : 'sea'}
              value={deal.lastActivityLabel}
            />
            <MetaItem icon={UserRound} label="Source" tone="slate" value={deal.source ? deal.source.charAt(0).toUpperCase() + deal.source.slice(1) : 'Unknown'} />
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500">Signals</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {deal.flags.length > 0 ? (
                deal.flags.map((flag) => (
                  <Badge key={flag.label} tone={flag.tone}>
                    {flag.label}
                  </Badge>
                ))
              ) : (
                <Badge tone="green">Clean CRM signal</Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Latest note</p>
            <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {note}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Why this appears here</p>
            <ul className="mt-2 space-y-2 text-sm leading-5 text-stone-700">
              {deal.why.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{cleanText(reason)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-1" />
        </div>
      </div>
    </aside>
  );
}
