# NOTES

Answer each prompt below. Short and specific beats long and generic.

## 1. The top of the view

Which deals does your UI put in front of Jordan first, and what's the reasoning behind that ordering? Where might a sharp rep disagree with it?

The UI puts late-stage, time-sensitive deals first: close dates, active legal/procurement work, and clearly named next steps. 'Act today' is the short morning queue, 'Verify risk' is for stale or misleading records, and 'All open' is the searchable full pipeline.

A strong rep might override the ranking if they know, for example, that a "stale" deal already has a verbal yes or that a large late-stage deal is blocked on an internal legal step rather than buyer intent.

## 2. What you left out

What did you deliberately not show, and why?

I left out CRM editing, routing, and reporting charts. They matter, but they distract from the Monday-morning triage question. Closed deals stay out of the queue and only appear in the footer count.

I also hide details and filters until Jordan asks for them. The default view stays list-first; selecting a deal opens context, and tab changes clear selection because rank changes across queues.

## 3. Where the data lies

Where does the dataset mislead a naive reading of it, and what does your UI do about that?

Close dates are the biggest lie. Some overdue deals are weak and stale, so they belong in forecast-risk cleanup, not the morning action queue. Others are still active because the latest note shows a real path to signature.

The dataset also has missing amounts, blank close dates, stale activity, and lost champions. Those signals are surfaced directly and pushed into 'Verify risk'.

## 4. The weakest part

What's the weakest part of what you built? What would you fix first, and what stopped you this pass?

The weakest part is the deterministic note parsing and weighting in `dealEvaluator.ts`. It is still a hand-tuned heuristic over one dataset.

The first fix would be reviewing the ranked list deal-by-deal with a few reps and adjusting which signals should outweigh stale close dates, missing fields, or legal-review language.

## 5. With another day

What would you cut, change, or add?

1. Add tests around scoring and date logic.
2. Sync tab and filters to the URL.
3. Make note signals more robust across different wording.
4. Tune the ranking with real AE feedback.
