import type { Deal } from '../types/deal';
import type { LucideIcon } from 'lucide-react';

export type PriorityTier = 'today' | 'risk' | 'pipeline';
export type FlagTone = 'red' | 'amber' | 'green' | 'blue' | 'moss' | 'slate';
export type IconTone = 'primary' | 'moss' | 'sea' | 'amber' | 'red' | 'slate';
export type ViewMode = PriorityTier;
export type RiskFilter = 'all' | 'close' | 'stale' | 'missing' | 'parked';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface DealFlag {
  label: string;
  tone: FlagTone;
  kind: RiskFilter | 'positive' | 'deadline' | 'info';
}

export interface DealInsight extends Deal {
  action: string;
  actionDetail: string;
  amountLabel: string;
  closeLabel: string;
  confidence: ConfidenceLevel;
  daysSinceActivity: number | null;
  daysToClose: number | null;
  flags: DealFlag[];
  isClosed: boolean;
  lastActivityLabel: string;
  priorityTier: PriorityTier;
  riskScore: number;
  score: number;
  stageLabel: string;
  why: string[];
}

export interface ModeCopyEntry {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  headline: string;
  subhead: string;
}
