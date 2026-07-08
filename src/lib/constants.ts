import { BriefcaseBusiness, ShieldAlert, Sparkles } from 'lucide-react';
import type { DealStage } from '../types/deal';
import type { FlagTone, IconTone, ModeCopyEntry, ViewMode } from './types';

export const TODAY = '2026-07-06';

export const STAGE_LABELS: Record<DealStage, string> = {
  prospecting: 'Prospecting',
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed won',
  closed_lost: 'Closed lost',
};

export const STAGE_WEIGHT: Record<DealStage, number> = {
  prospecting: 10,
  qualification: 22,
  proposal: 36,
  negotiation: 52,
  closed_won: 0,
  closed_lost: 0,
};

export const stageOptions: Array<'all' | DealStage> = [
  'all',
  'negotiation',
  'proposal',
  'qualification',
  'prospecting',
];

export const modeCopy: Record<ViewMode, ModeCopyEntry> = {
  today: {
    label: 'Act today',
    shortLabel: 'Act',
    icon: Sparkles,
    headline: 'Next best deals',
    subhead: 'Actionable morning moves to review before your first call.',
  },
  risk: {
    label: 'Verify risk',
    shortLabel: 'Risk',
    icon: ShieldAlert,
    headline: 'Risk review',
    subhead: 'Stale or misleading records to verify before forecasting.',
  },
  pipeline: {
    label: 'All open',
    shortLabel: 'All',
    icon: BriefcaseBusiness,
    headline: 'Open pipeline',
    subhead: 'All open deals ranked by priority, keeping parked work quiet.',
  },
};

export const flagToneClasses: Record<FlagTone, string> = {
  red: 'border-red-200 bg-red-50 text-red-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  moss: 'border-green-200 bg-green-50 text-green-800',
  slate: 'border-stone-200 bg-stone-100 text-stone-700',
};

export const iconToneClasses: Record<IconTone, { icon: string; shell: string }> = {
  primary: {
    icon: 'text-primary',
    shell: 'border-blue-100 bg-primarySoft shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  },
  moss: {
    icon: 'text-moss',
    shell: 'border-emerald-100 bg-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  },
  sea: {
    icon: 'text-sea',
    shell: 'border-sky-100 bg-sky-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  },
  amber: {
    icon: 'text-signal',
    shell: 'border-amber-100 bg-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  },
  red: {
    icon: 'text-red-600',
    shell: 'border-red-100 bg-red-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  },
  slate: {
    icon: 'text-stone-500',
    shell: 'border-stone-200 bg-stone-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
  },
};
