import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { iconToneClasses } from '../lib/constants';
import type { IconTone } from '../lib/types';

export function MetaItem({ icon: Icon, label, tone = 'slate', value }: { icon: LucideIcon; label: string; tone?: IconTone; value: string }) {
  const toneClasses = iconToneClasses[tone];

  return (
    <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-[0_10px_26px_-24px_rgba(24,34,47,0.38)]">
      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border', toneClasses.shell)}>
          <Icon className={cn('h-3.5 w-3.5', toneClasses.icon)} aria-hidden="true" />
        </span>
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
