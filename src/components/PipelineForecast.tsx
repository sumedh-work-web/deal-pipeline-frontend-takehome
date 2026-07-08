import { cn } from '../lib/utils';
import { STAGE_LABELS } from '../lib/constants';
import type { DealInsight } from '../lib/types';
import type { DealStage } from '../types/deal';

const stageBarColors: Partial<Record<DealStage, string>> = {
  negotiation: 'bg-primary',
  proposal: 'bg-moss',
  qualification: 'bg-signal',
  prospecting: 'bg-stone-400',
};

const stageDotColors: Partial<Record<DealStage, string>> = {
  negotiation: 'bg-primary',
  proposal: 'bg-moss',
  qualification: 'bg-signal',
  prospecting: 'bg-stone-400',
};

const FORECAST_STAGES: DealStage[] = ['negotiation', 'proposal', 'qualification', 'prospecting'];

interface StageGroup {
  stage: DealStage;
  count: number;
  percentage: number;
}

export function PipelineForecast({ deals }: { deals: DealInsight[] }) {
  const total = deals.length;
  if (total === 0) return null;

  const groups: StageGroup[] = FORECAST_STAGES
    .map((stage) => {
      const count = deals.filter((d) => d.stage === stage).length;
      return { stage, count, percentage: (count / total) * 100 };
    })
    .filter((g) => g.count > 0);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
        {groups.map((group) => (
          <div
            key={group.stage}
            className={cn('transition-all', stageBarColors[group.stage])}
            style={{ width: `${group.percentage}%` }}
            title={`${STAGE_LABELS[group.stage]}: ${group.count} deals`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        {groups.map((group) => (
          <span key={group.stage} className="flex items-center gap-1.5">
            <span className={cn('inline-block h-2 w-2 rounded-full', stageDotColors[group.stage])} />
            {STAGE_LABELS[group.stage]} · {group.count}
          </span>
        ))}
      </div>
    </div>
  );
}
