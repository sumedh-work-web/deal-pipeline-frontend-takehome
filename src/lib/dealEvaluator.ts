import type { Deal } from '../types/deal';
import type { DealFlag, DealInsight, PriorityTier, RiskFilter } from './types';
import { STAGE_LABELS, STAGE_WEIGHT, TODAY } from './constants';
import { activityLabel, closeLabel, daysBetween, formatAmount, formatDate } from './formatters';

interface ActionRule {
  matches: boolean;
  action: string;
  detail: string;
}

function addFlag(flags: DealFlag[], flag: DealFlag) {
  if (!flags.some((existing) => existing.label === flag.label)) {
    flags.push(flag);
  }
}

function resolveAction(rules: ActionRule[], fallback: Pick<ActionRule, 'action' | 'detail'>) {
  const matchedRule = rules.find((rule) => rule.matches);
  return {
    action: matchedRule?.action ?? fallback.action,
    actionDetail: matchedRule?.detail ?? fallback.detail,
  };
}

/** Score, flag, and classify a single deal for the cockpit. */
export function inferDeal(deal: Deal): DealInsight {
  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost';
  const daysToClose = deal.expectedCloseDate ? daysBetween(TODAY, deal.expectedCloseDate) : null;
  const lastActivityDate = deal.lastActivity?.timestamp.slice(0, 10);
  const daysSinceActivity = lastActivityDate ? daysBetween(lastActivityDate, TODAY) : null;
  const note = deal.lastActivity?.note ?? '';
  const noteLower = note.toLowerCase();
  const flags: DealFlag[] = [];
  const why: string[] = [];

  // Boolean signals
  const isLateStage = deal.stage === 'negotiation' || deal.stage === 'proposal';
  const hasCloseRisk = daysToClose != null && daysToClose <= 14;
  const isRecentlyOverdue = daysToClose != null && daysToClose < 0 && daysToClose >= -7;
  const isOldOverdue = daysToClose != null && daysToClose < -7;
  const isSeverelyOverdue = daysToClose != null && daysToClose < -14;
  const isStale = daysSinceActivity == null || daysSinceActivity >= 14;
  const isVeryStale = daysSinceActivity == null || daysSinceActivity >= 30;

  // Note-based patterns
  const isParked = /hold all outreach|revisit in the fall|budget freeze|maybe next quarter|ooo until|back july 20|after quarter-end/i.test(note);
  const isLowResponse = /no response|left voicemail|no reply|quiet since|gone quiet|no direct contact/i.test(note);
  const championLost = /champion .*left|left the company|backfill unknown/i.test(note);
  const legalPath = /procurement|msa|counsel|redlines|order form|signature|legal/i.test(note);
  const finalPricing = /final pricing/i.test(note);
  const renewalQuote = /renewal quote/i.test(note);
  const scheduledSoon = /wednesday|this week|early this week|end of this week|july 8|july 10|fiscal close/i.test(noteLower);
  const securityQuestionnaire = /security questionnaire/i.test(note);
  const securityPackage = /security package/i.test(note);
  const scheduledCall = /call set|call booked|discovery call booked/i.test(note);
  const referencesRequested = /references/i.test(note);
  const caseStudyRequested = /case study/i.test(note);
  const demoRequested = /demo/i.test(note);
  const shopifyQuestion = /shopify/i.test(note);
  const multiYearDiscount = /multi-year discount/i.test(note);
  const paymentTerms = /payment terms/i.test(note);
  const pricingAction =
    finalPricing || paymentTerms || multiYearDiscount || renewalQuote;
  const movingScope = /scope still moving|seat count/i.test(note);
  const missingCoreFields =
    daysSinceActivity == null && deal.amount == null && !deal.expectedCloseDate;
  const weakOldClose = isOldOverdue && (isVeryStale || isLowResponse);

  // Flag assignment
  if (daysToClose != null && daysToClose < 0) {
    addFlag(flags, { label: 'Overdue close date', tone: isRecentlyOverdue ? 'amber' : 'red', kind: 'close' });
    why.push(`${formatDate(deal.expectedCloseDate)} close date has passed.`);
  } else if (daysToClose != null && daysToClose <= 1) {
    addFlag(flags, { label: closeLabel(daysToClose, deal.expectedCloseDate), tone: 'red', kind: 'deadline' });
    why.push('Close date is inside the next day.');
  } else if (daysToClose != null && daysToClose <= 7) {
    addFlag(flags, { label: closeLabel(daysToClose, deal.expectedCloseDate), tone: 'amber', kind: 'deadline' });
    why.push('Close date is inside this week.');
  } else if (daysToClose != null && daysToClose <= 14) {
    addFlag(flags, { label: closeLabel(daysToClose, deal.expectedCloseDate), tone: 'blue', kind: 'deadline' });
    why.push('Close date is inside two weeks.');
  }

  if (daysSinceActivity == null) {
    addFlag(flags, { label: 'No activity', tone: 'red', kind: 'stale' });
    why.push('There is no last activity recorded.');
  } else if (daysSinceActivity >= 30) {
    addFlag(flags, { label: `${daysSinceActivity}d stale`, tone: 'red', kind: 'stale' });
    why.push('The deal has been quiet for more than a month.');
  } else if (daysSinceActivity >= 14) {
    addFlag(flags, { label: `${daysSinceActivity}d stale`, tone: 'amber', kind: 'stale' });
    why.push('The deal has not moved in at least two weeks.');
  }

  if (!deal.expectedCloseDate) {
    addFlag(flags, { label: 'Missing close date', tone: 'amber', kind: 'missing' });
    why.push('Expected close date is missing.');
  }
  if (deal.amount == null) {
    addFlag(flags, { label: 'Missing amount', tone: 'amber', kind: 'missing' });
    why.push('Deal amount is missing.');
  }
  if (isParked) {
    addFlag(flags, { label: 'Timing blocked', tone: 'slate', kind: 'parked' });
    why.push('The note says timing is blocked or delayed.');
  }
  if (championLost) {
    addFlag(flags, { label: 'Champion risk', tone: 'red', kind: 'parked' });
    why.push('The last note says the champion left.');
  }
  if (isLowResponse) {
    addFlag(flags, { label: 'Low response', tone: 'amber', kind: 'stale' });
  }
  if (legalPath) {
    addFlag(flags, { label: 'Legal/procurement', tone: 'moss', kind: 'positive' });
  }
  if (pricingAction) {
    addFlag(flags, { label: 'Pricing action', tone: 'blue', kind: 'positive' });
  }

  // Action inference
  const { action, actionDetail } = resolveAction(
    [
      {
        matches: missingCoreFields,
        action: 'Qualify or remove from active pipeline',
        detail: 'No amount, close date, or activity is recorded.',
      },
      {
        matches: championLost,
        action: 'Find a new champion',
        detail: 'Do not forecast this until there is a buyer-side owner again.',
      },
      {
        matches: isParked,
        action: 'Park with a dated reminder',
        detail: 'The note points to timing, budget, or availability as the blocker.',
      },
      {
        matches: weakOldClose,
        action: 'Verify or close out',
        detail: 'The close date is old and the latest signal is weak.',
      },
      {
        matches: multiYearDiscount,
        action: 'Decide the discount position',
        detail: 'The buyer needs a commercial answer before taking this forward.',
      },
      {
        matches: paymentTerms,
        action: 'Respond on payment terms',
        detail: 'The next blocker is commercial, not discovery.',
      },
      {
        matches: renewalQuote,
        action: 'Position against the renewal quote',
        detail: 'The buyer is comparing this against their current vendor.',
      },
      {
        matches: finalPricing,
        action: 'Send final pricing',
        detail: 'The buyer has budget approval and asked for pricing by Wednesday.',
      },
      {
        matches: securityQuestionnaire,
        action: 'Chase the security questionnaire',
        detail: 'Security is due back July 10 and can block the proposal path.',
      },
      {
        matches: securityPackage,
        action: 'Send the security package',
        detail: 'The CFO asked for it by the end of this week.',
      },
      {
        matches: legalPath,
        action: 'Confirm the signature path',
        detail: 'Legal or procurement review is the current blocker.',
      },
      {
        matches: scheduledCall,
        action: 'Prep the scheduled call',
        detail: 'There is a dated meeting to make productive.',
      },
      {
        matches: referencesRequested,
        action: 'Send requested references',
        detail: 'The buyer asked for proof from comparable customers.',
      },
      {
        matches: caseStudyRequested,
        action: 'Send recap and case study',
        detail: 'The next step is already named in the activity note.',
      },
      {
        matches: demoRequested,
        action: 'Schedule the requested demo',
        detail: 'The buyer needs more stakeholders to see the workflow.',
      },
      {
        matches: shopifyQuestion,
        action: 'Answer the Shopify question',
        detail: 'A concrete integration question is better than a generic bump.',
      },
      {
        matches: movingScope,
        action: 'Lock scope before quoting',
        detail: 'The amount is uncertain because the buyer has not fixed scope.',
      },
      {
        matches: !deal.expectedCloseDate,
        action: 'Set a real close date',
        detail: 'A pipeline item without a close date should not be forecast.',
      },
      {
        matches: deal.amount == null,
        action: 'Lock scope and amount',
        detail: 'The deal needs a commercial range before it can be prioritized well.',
      },
      {
        matches: isStale && deal.stage === 'prospecting',
        action: 'Send a short re-engagement note',
        detail: 'Early-stage interest is fading without a fresh buyer response.',
      },
      {
        matches: isStale,
        action: 'Revive with a specific next step',
        detail: 'The deal is too stale to leave as an optimistic forecast.',
      },
      {
        matches: deal.stage === 'negotiation',
        action: 'Confirm close plan',
        detail: 'Late-stage deals need a buyer-owned date and blocker list.',
      },
      {
        matches: deal.stage === 'proposal',
        action: 'Create a buyer-specific follow-up',
        detail: 'The proposal is out. Anchor the next move to the buyer note.',
      },
      {
        matches: deal.stage === 'qualification',
        action: 'Secure the next meeting',
        detail: 'The deal still needs a stronger mutual plan.',
      },
    ],
    {
      action: 'Qualify interest',
      detail: 'Find the buyer problem, owner, and date before forecasting.',
    },
  );

  // Priority tier
  const activeCloseSoon = isLateStage && hasCloseRisk && !championLost && !isParked && !(isOldOverdue && (isVeryStale || isLowResponse));
  const explicitThisWeekWork = scheduledSoon && !championLost && !isParked && daysSinceActivity != null && daysSinceActivity <= 10;
  const hasRisk =
    isOldOverdue ||
    isStale ||
    isParked ||
    championLost ||
    isLowResponse ||
    !deal.expectedCloseDate ||
    deal.amount == null;

  let priorityTier: PriorityTier = 'pipeline';
  if (!isClosed && (activeCloseSoon || explicitThisWeekWork)) {
    priorityTier = 'today';
  } else if (!isClosed && hasRisk) {
    priorityTier = 'risk';
  }

  // Scoring
  const closeScore =
    daysToClose == null
      ? 0
      : daysToClose < -14
        ? 24
        : daysToClose < 0
          ? 48
          : daysToClose <= 1
            ? 82
            : daysToClose <= 4
              ? 64
              : daysToClose <= 7
                ? 54
                : daysToClose <= 14
                  ? 38
                  : daysToClose <= 30
                    ? 18
                    : 0;
  const amountScore = deal.amount == null ? 0 : Math.min(deal.amount / 5_000, 36);
  const score =
    STAGE_WEIGHT[deal.stage] +
    closeScore +
    amountScore +
    (scheduledSoon ? 24 : 0) +
    (legalPath || pricingAction ? 14 : 0) -
    (championLost ? 90 : 0) -
    (isParked ? 70 : 0) -
    (isVeryStale && isOldOverdue ? 65 : 0);

  const riskScore =
    (isVeryStale ? 64 : isStale ? 28 : 0) +
    (isOldOverdue ? 50 : isRecentlyOverdue ? 26 : 0) +
    (championLost ? 48 : 0) +
    (isParked ? 36 : 0) +
    (isLowResponse ? 22 : 0) +
    (!deal.expectedCloseDate ? 16 : 0) +
    (deal.amount == null ? 16 : 0) +
    amountScore;

  const confidence: DealInsight['confidence'] =
    championLost ||
    isParked ||
    isVeryStale ||
    daysSinceActivity == null ||
    (isSeverelyOverdue && legalPath)
      ? 'Low'
      : isStale || !deal.expectedCloseDate || deal.amount == null || isOldOverdue
        ? 'Medium'
        : 'High';

  if (priorityTier === 'today' && isSeverelyOverdue && legalPath) {
    priorityTier = 'risk';
    if (!why.includes('The close date is stale enough that the rep should verify the timeline before treating this as a near-term close.')) {
      why.push('The close date is stale enough that the rep should verify the timeline before treating this as a near-term close.');
    }
  }

  if (why.length === 0) {
    why.push('Recent activity and CRM fields are usable.');
  }

  return {
    ...deal,
    action,
    actionDetail,
    amountLabel: formatAmount(deal),
    closeLabel: closeLabel(daysToClose, deal.expectedCloseDate),
    confidence,
    daysSinceActivity,
    daysToClose,
    flags,
    isClosed,
    lastActivityLabel: activityLabel(daysSinceActivity),
    priorityTier,
    riskScore,
    score,
    stageLabel: STAGE_LABELS[deal.stage],
    why,
  };
}

/** Multi-field text search across deal properties. */
export function matchesSearch(deal: DealInsight, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return [
    deal.company,
    deal.contactName,
    deal.contactTitle,
    deal.owner,
    deal.source,
    deal.stageLabel,
    deal.action,
    deal.lastActivity?.note,
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query));
}

/** Filter deals by risk signal kind. */
export function matchesRiskFilter(deal: DealInsight, filter: RiskFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'close') {
    return deal.flags.some((flag) => flag.kind === 'close' || flag.kind === 'deadline');
  }
  return deal.flags.some((flag) => flag.kind === filter);
}
