import { cn } from '../lib/utils';
import { Badge } from './Badge';
import type { DealInsight } from '../lib/types';

export function QueueRow({
  compactSignals,
  deal,
  index,
  rowRef,
  selected,
  onSelect,
}: {
  compactSignals: boolean;
  deal: DealInsight;
  index: number;
  rowRef?: (node: HTMLButtonElement | null) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const isQuietPipelineRow = compactSignals && deal.confidence === 'Low';
  const signalFlags = deal.flags.filter((flag) => flag.kind !== 'deadline' && flag.kind !== 'close');
  const topFlags = (signalFlags.length > 0 ? signalFlags : deal.flags).slice(0, 1);
  const closeTone =
    deal.daysToClose != null && deal.daysToClose < 0
      ? 'text-red-600'
      : deal.daysToClose != null && deal.daysToClose <= 7
        ? 'text-amber-600'
        : 'text-stone-500';

  return (
    <button
      ref={rowRef}
      data-selected-row={selected ? 'true' : undefined}
      type="button"
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-l-4 border-b-slate-200 px-3 py-2.5 text-left transition-all active:scale-[0.998] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/25',
        selected
          ? 'border-l-primary bg-primarySoft shadow-[inset_0_1px_0_rgba(37,99,235,0.16)]'
          : isQuietPipelineRow
            ? 'border-l-transparent bg-slate-50/60 hover:bg-slate-50 motion-safe:hover:-translate-y-px motion-safe:hover:shadow-sm'
            : 'border-l-transparent bg-white hover:bg-slate-50 motion-safe:hover:-translate-y-px motion-safe:hover:shadow-sm',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md border font-mono text-xs font-semibold',
          selected
            ? 'border-primary bg-primary text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.9)]'
            : 'border-slate-200 bg-white text-slate-500',
        )}
      >
        {index + 1}
      </span>

      <span className="min-w-0">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className={cn('block truncate text-sm font-semibold', selected || !isQuietPipelineRow ? 'text-ink' : 'text-stone-700')}>
              {deal.company}
            </span>
            <span className={cn('mt-0.5 block truncate text-sm', selected || !isQuietPipelineRow ? 'text-stone-600' : 'text-stone-500')}>
              {deal.action}
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className={cn('block font-mono text-sm font-semibold', selected || !isQuietPipelineRow ? 'text-ink' : 'text-stone-700')}>
              {deal.amountLabel}
            </span>
            <span className={cn('mt-0.5 block text-xs font-medium', closeTone)}>{deal.closeLabel}</span>
          </span>
        </span>

        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {topFlags.map((flag) => (
            <Badge key={flag.label} tone={flag.tone}>
              {flag.label}
            </Badge>
          ))}
        </span>
      </span>
    </button>
  );
}
