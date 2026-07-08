import type { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { flagToneClasses } from '../lib/constants';
import type { FlagTone } from '../lib/types';

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: FlagTone }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-5 items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none transition motion-safe:hover:brightness-105',
        flagToneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
