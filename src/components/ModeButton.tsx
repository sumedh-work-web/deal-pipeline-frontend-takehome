import { cn } from '../lib/utils';
import { modeCopy } from '../lib/constants';
import type { ViewMode } from '../lib/types';

export function ModeButton({
  active,
  count,
  mode,
  onClick,
}: {
  active: boolean;
  count: number;
  mode: ViewMode;
  onClick: () => void;
}) {
  const { icon: Icon, label, shortLabel } = modeCopy[mode];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-[34px] min-w-0 items-center justify-between gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/25',
        active
          ? 'bg-white text-ink shadow-sm ring-1 ring-inset ring-primary/20'
          : 'text-slate-600 hover:bg-white/70 hover:text-ink',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-primary' : 'text-slate-500')} aria-hidden="true" />
        <span className="hidden truncate sm:inline">{label}</span>
        <span className="truncate sm:hidden">{shortLabel}</span>
      </span>
      <span className={cn('font-mono text-xs', active ? 'text-primary' : 'text-slate-500')}>{count}</span>
    </button>
  );
}
