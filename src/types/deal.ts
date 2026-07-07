export type DealStage =
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

export interface DealActivity {
  type: ActivityType;
  /** ISO 8601 datetime */
  timestamp: string;
  note?: string;
}

export interface Deal {
  id: string;
  company: string;
  contactName?: string;
  contactTitle?: string;
  /** In the deal's currency */
  amount?: number;
  /** ISO 4217 code, e.g. "USD" */
  currency: string;
  stage: DealStage;
  /** YYYY-MM-DD */
  expectedCloseDate?: string;
  /** YYYY-MM-DD */
  createdDate: string;
  lastActivity?: DealActivity;
  owner: string;
  source?: string;
}
