import { useEffect, useMemo, useRef, useState } from "react";
import {
  Filter,
  PanelRightClose,
  PanelRightOpen,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  X,
  Inbox,
} from "lucide-react";
import rawDeals from "./data/deals.json";
import type { Deal, DealStage } from "./types/deal";
import type { RiskFilter, ViewMode } from "./lib/types";
import { formatPipelineTotal } from "./lib/formatters";
import {
  inferDeal,
  matchesRiskFilter,
  matchesSearch,
} from "./lib/dealEvaluator";
import { modeCopy, STAGE_LABELS, stageOptions } from "./lib/constants";
import { ModeButton } from "./components/ModeButton";
import { QueueRow } from "./components/QueueRow";
import { DetailPanel } from "./components/DetailPanel";
import { EmptyState } from "./components/EmptyState";
import { PipelineForecast } from "./components/PipelineForecast";
import { cn } from "./lib/utils";

const deals = rawDeals as Deal[];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | DealStage>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const queueViewportRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileDialogRef = useRef<HTMLDivElement | null>(null);

  const insights = useMemo(() => deals.map(inferDeal), []);
  const openDeals = useMemo(
    () => insights.filter((deal) => !deal.isClosed),
    [insights],
  );
  const closedCount = useMemo(
    () => insights.filter((deal) => deal.isClosed).length,
    [insights],
  );

  const todayDeals = useMemo(
    () =>
      openDeals
        .filter((deal) => deal.priorityTier === "today")
        .sort((a, b) => b.score - a.score || (b.amount ?? 0) - (a.amount ?? 0)),
    [openDeals],
  );

  const riskDeals = useMemo(
    () =>
      openDeals
        .filter((deal) => deal.priorityTier === "risk")
        .sort((a, b) => b.riskScore - a.riskScore || b.score - a.score),
    [openDeals],
  );

  const allRankedDeals = useMemo(
    () =>
      [...openDeals].sort(
        (a, b) =>
          b.score - a.score ||
          b.riskScore - a.riskScore ||
          a.company.localeCompare(b.company),
      ),
    [openDeals],
  );

  const modeDeals =
    viewMode === "today"
      ? todayDeals
      : viewMode === "risk"
        ? riskDeals
        : allRankedDeals;

  const filteredDeals = useMemo(
    () =>
      modeDeals
        .filter((deal) => matchesSearch(deal, search))
        .filter((deal) => stageFilter === "all" || deal.stage === stageFilter)
        .filter((deal) => matchesRiskFilter(deal, riskFilter)),
    [modeDeals, riskFilter, search, stageFilter],
  );

  const selectedDeal = selectedDealId
    ? filteredDeals.find((deal) => deal.id === selectedDealId) ?? null
    : null;
  const topTodayDeal = todayDeals[0] ?? null;
  const overdueCount = openDeals.filter(
    (deal) => deal.daysToClose != null && deal.daysToClose < 0,
  ).length;
  const activeFilterCount =
    (search ? 1 : 0) +
    (stageFilter !== "all" ? 1 : 0) +
    (riskFilter !== "all" ? 1 : 0);

  const queueEmptyState = useMemo(() => {
    if (openDeals.length === 0) {
      return {
        icon: Inbox,
        title: "No active deals",
        subtitle: "Sync new deals in your CRM to begin prioritizing your morning actions.",
      };
    }
    if (
      viewMode === "today" &&
      todayDeals.length === 0 &&
      !search &&
      stageFilter === "all" &&
      riskFilter === "all"
    ) {
      return {
        icon: Sparkles,
        title: "You're all caught up",
        subtitle: "No items require action today. Review the risk or pipeline queues for other records.",
      };
    }
    return {
      icon: Search,
      title: "No deals match the current filters",
      subtitle: "Clear search or widen the filters to restore the work queue.",
    };
  }, [openDeals.length, viewMode, todayDeals.length, search, stageFilter, riskFilter]);

  const headerSubhead =
    viewMode === "today"
      ? topTodayDeal
        ? `${todayDeals.length} moves this morning. Start with ${topTodayDeal.company}: ${topTodayDeal.action.toLowerCase()} (${topTodayDeal.closeLabel.toLowerCase()}).`
        : "No must-do moves this morning. Verify risk or scan the open pipeline next."
      : modeCopy[viewMode].subhead;

  function clearSelection() {
    setSelectedDealId(null);
    setIsDetailPanelOpen(false);
    setIsDrawerOpen(false);
  }

  function handleViewModeChange(mode: ViewMode) {
    if (mode === viewMode) return;
    setViewMode(mode);
    setStageFilter("all");
    setRiskFilter("all");
    clearSelection();
  }

  function handleSelectDeal(id: string) {
    setSelectedDealId(id);
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setIsDetailPanelOpen(true);
    } else {
      setIsDrawerOpen(true);
    }
  }

  function handleToggleDetailPanel() {
    if (isDetailPanelOpen) {
      clearSelection();
      return;
    }
    setIsDetailPanelOpen(true);
  }

  useEffect(() => {
    if (!selectedDealId) return;
    if (!filteredDeals.some((deal) => deal.id === selectedDealId)) {
      clearSelection();
    }
  }, [filteredDeals, selectedDealId]);

  useEffect(() => {
    const pane = queueViewportRef.current;
    const row = selectedDealId ? rowRefs.current[selectedDealId] : null;
    if (!pane || !row) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const paneRect = pane.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const rowIsClipped =
      rowRect.top < paneRect.top + 8 || rowRect.bottom > paneRect.bottom - 8;
    if (!rowIsClipped) return;

    pane.scrollTo({
      top: Math.max(0, pane.scrollTop + rowRect.top - paneRect.top - 8),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [selectedDealId, viewMode]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const previousActive = document.activeElement as HTMLElement | null;
    mobileDialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActive?.focus?.();
    };
  }, [isDrawerOpen]);

  return (
    <main className="h-[100dvh] overflow-hidden bg-[linear-gradient(135deg,#f4f7fb_0%,#eef4f8_48%,#eff2ff_100%)] text-ink">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-2 px-3 py-2 sm:px-4">
        <header className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-soft">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.9)]">
                  <Target className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>Jordan Ellis</span>
                <span className="text-slate-300">/</span>
                <span>Monday, July 6, 2026</span>
              </div>
              <h1 className="mt-1.5 text-xl font-semibold tracking-normal text-ink sm:text-2xl">
                {modeCopy[viewMode].headline}
              </h1>
              <p className="max-w-3xl text-xs leading-4 text-stone-600 sm:text-sm">
                {headerSubhead}
              </p>
            </div>
            <div className="grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-slate-50/70 lg:min-w-[280px]">
              <div className="px-4 py-2.5 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Open pipeline</p>
                <p className="mt-0.5 whitespace-nowrap font-mono text-lg font-semibold leading-6 text-ink">{formatPipelineTotal(openDeals)}</p>
              </div>
              <div className="border-l border-slate-200 px-4 py-2.5 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Overdue</p>
                <p className="mt-0.5 font-mono text-lg font-semibold leading-6 text-ink">{overdueCount}</p>
              </div>
            </div>
          </div>
        </header>

        <section
          className={cn(
            "grid min-h-0 flex-1 gap-2",
            isDetailPanelOpen
              ? "lg:grid-cols-[minmax(0,1fr)_430px]"
              : "lg:grid-cols-1",
          )}
        >
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="shrink-0 border-b border-slate-200 bg-white p-3">
              <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  {(["today", "risk", "pipeline"] as ViewMode[]).map((mode) => (
                    <ModeButton
                      key={mode}
                      active={viewMode === mode}
                      count={
                        mode === "today"
                          ? todayDeals.length
                          : mode === "risk"
                            ? riskDeals.length
                            : allRankedDeals.length
                      }
                      mode={mode}
                      onClick={() => handleViewModeChange(mode)}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-2 sm:grid-cols-[auto_44px]">
                  <button
                    type="button"
                    onClick={() => setAreFiltersOpen((open) => !open)}
                    aria-expanded={areFiltersOpen}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25",
                      areFiltersOpen || activeFilterCount > 0
                        ? "border-primary/30 bg-primarySoft text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                    )}
                  >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleDetailPanel}
                    aria-pressed={isDetailPanelOpen}
                    aria-label={isDetailPanelOpen ? "Hide detail panel" : "Show detail panel"}
                    className="hidden h-11 items-center justify-center rounded-md border border-slate-200 bg-white text-primary transition hover:border-primary/30 hover:bg-primarySoft focus:outline-none focus:ring-2 focus:ring-primary/25 lg:inline-flex"
                  >
                    {isDetailPanelOpen ? (
                      <PanelRightClose className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {areFiltersOpen && (
                <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_160px_180px]">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Search deals
                    </span>
                    <span className="relative block">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70"
                        aria-hidden="true"
                      />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Company, note, source"
                        className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-8 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          aria-label="Clear search"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-ink focus:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Stage
                    </span>
                    <span className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <Filter className="h-4 w-4 text-sea" aria-hidden="true" />
                      <select
                        value={stageFilter}
                        onChange={(event) =>
                          setStageFilter(event.target.value as "all" | DealStage)
                        }
                        className="w-full bg-transparent text-sm outline-none"
                      >
                        {stageOptions.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage === "all" ? "All stages" : STAGE_LABELS[stage]}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Signal
                    </span>
                    <span className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <ShieldAlert
                        className="h-4 w-4 text-signal"
                        aria-hidden="true"
                      />
                      <select
                        value={riskFilter}
                        onChange={(event) =>
                          setRiskFilter(event.target.value as RiskFilter)
                        }
                        className="w-full bg-transparent text-sm outline-none"
                      >
                        <option value="all">All signals</option>
                        <option value="close">Close risk</option>
                        <option value="stale">Stale</option>
                        <option value="missing">Missing data</option>
                        <option value="parked">Parked</option>
                      </select>
                    </span>
                  </label>

                  {activeFilterCount > 0 && (
                    <div className="md:col-span-3 md:flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStageFilter("all");
                          setRiskFilter("all");
                        }}
                        className="text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus:outline-none"
                      >
                        Clear active filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {viewMode === "pipeline" && (
                <PipelineForecast deals={allRankedDeals} />
              )}
            </div>

            <div
              ref={queueViewportRef}
              data-queue-pane="true"
              className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]"
            >
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal, index) => (
                  <QueueRow
                    key={deal.id}
                    compactSignals={viewMode === "pipeline"}
                    deal={deal}
                    index={index}
                    rowRef={(node) => {
                      rowRefs.current[deal.id] = node;
                    }}
                    selected={selectedDeal?.id === deal.id}
                    onSelect={() => handleSelectDeal(deal.id)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={queueEmptyState.icon}
                  title={queueEmptyState.title}
                  subtitle={queueEmptyState.subtitle}
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span>
                {filteredDeals.length} shown from {openDeals.length} open deals.{" "}
                {closedCount} closed records excluded.
              </span>
            </div>
          </div>

          {isDetailPanelOpen && (
            <div className="hidden min-h-0 lg:block">
              <DetailPanel
                key={selectedDeal?.id ?? "empty"}
                deal={selectedDeal}
                isPipelineEmpty={openDeals.length === 0}
              />
            </div>
          )}
        </section>
      </div>

      {isDrawerOpen && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 lg:hidden animate-fadeInBackdrop">
          <div
            className="absolute inset-0"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div
            ref={mobileDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-deal-details-title"
            tabIndex={-1}
            className="relative z-10 flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-xl animate-slideUp focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span
                id="mobile-deal-details-title"
                className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Deal details
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close deal details"
                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-ink focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <DetailPanel
                key={selectedDeal.id}
                deal={selectedDeal}
                isPipelineEmpty={openDeals.length === 0}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
