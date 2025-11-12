import { useMemo, useState } from "react";
import {
  MessageSquareText,
  Gauge,
  Clock,
  Cpu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import ChatKpiCard from "@/components/StatsCard/ChatKpiCard";
import { InteractionsByHourChart, TokensByHourChart, LatencyByHourChart } from "@/components/charts";
import type { ChatFilter, Interaction as TypedInteraction } from "@/types/chatMetrics";
import { SERIES_COLORS } from "@/types/chatMetrics";
import { formatMs, formatInt, todayLocal } from "@/utils/format";
import { buildHourlySeries, computeKpis } from "@/utils/chatbot_metrics";
import ChatMetricsFilters from "@/components/ChatMetricsFilters/ChatMetricsFilters";
import ChatMetricsTable from "@/components/ChatMetricsTable/ChatMetricsTable";

/**
 * ========================================================================================
 * TYPES (LOCAL, MOCK-ONLY)
 * ----------------------------------------------------------------------------------------
 * These are only used to shape the MOCK data within this page. The app-wide Interaction
 * type (TypedInteraction) lives in "@/types/chatMetrics" and is what charts/selectors use.
 * When we plug the real API, we should delete these local row types and map the API shape
 * directly to `TypedInteraction`.
 * ========================================================================================
 */
type RowInteraction = {
  interactionId: number;
  timestamp: string; // ISO
  sessionId: number;
  chatFilter: ChatFilter; // "ALL" is not used per-row, but union is fine at compile time
  tokensInput: number;
  tokensOutput: number;
  responseTimeMs: number;
  userMessage: string;
  assistantMessage: string;
  ideaId?: number | null;
};

type DailyMetricsData = {
  summary: {
    totalInteractions: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    averageResponseTimeMs: number;
  };
  interactions: RowInteraction[];
};

/**
 * ========================================================================================
 * MOCK STATUS (LOCAL ONLY)
 * ----------------------------------------------------------------------------------------
 * This simulates loading/empty/error states. Replace with a single
 * `DataStatus` ("loading" | "error" | "empty" | "ready") and a `useChatMetrics()` hook.
 * ========================================================================================
 */
type MockMode = "ON" | "EMPTY" | "ERROR" | "LOADING";


/**
 * ========================================================================================
 * MOCK DATA (LOCAL ONLY)
 * ----------------------------------------------------------------------------------------
 * Integration note:
 * - Replace `buildMockMetrics()` with a call to your real fetch function.
 * - Keep the return shape compatible with TypedInteraction (or map to it).
 * ========================================================================================
 */
const EMPTY_METRICS: DailyMetricsData = {
  summary: {
    totalInteractions: 0,
    totalTokensInput: 0,
    totalTokensOutput: 0,
    averageResponseTimeMs: 0,
  },
  interactions: [],
};

// MOCK: generates a fixed sample for layout/dev UX
  // NOTE: We only use `startDate` to stamp times in this mock.
  // In real integration, this will honor both `startDate` & `endDate`.
function buildMockMetrics(
  startDate: string,
  chatFilter: ChatFilter
): DailyMetricsData {
  const baseInteractions: RowInteraction[] = [
    {
      interactionId: 1,
      timestamp: `${startDate}T09:15:00`,
      sessionId: 87,
      chatFilter: "FREE",
      tokensInput: 120,
      tokensOutput: 800,
      responseTimeMs: 5200,
      userMessage: "Como funciona o nosso chatbot mesmo?",
      assistantMessage: "Claro! O chatbot funciona a partir de...",
    },
    {
      interactionId: 2,
      timestamp: `${startDate}T10:42:00`,
      sessionId: 87,
      chatFilter: "CONTEXT",
      tokensInput: 90,
      tokensOutput: 1400,
      responseTimeMs: 6100,
      userMessage: "Me traga o histórico da última reunião",
      assistantMessage: "Encontrei isto no contexto...",
    },
    {
      interactionId: 3,
      timestamp: `${startDate}T11:05:00`,
      sessionId: 90,
      chatFilter: "FREE",
      tokensInput: 45,
      tokensOutput: 500,
      responseTimeMs: 4100,
      userMessage: "Gere uma ideia de post",
      assistantMessage: "Aqui vão 3 ideias...",
      ideaId: 192,
    },
  ];

  // Apply current type filter (ALL keeps both)
  const filteredByType =
    chatFilter === "ALL"
      ? baseInteractions
      : baseInteractions.filter((i) => i.chatFilter === chatFilter);

  // Derive summary (kept for parity with real API shape)
  const totalInteractions = filteredByType.length;
  const totalTokensInput = filteredByType.reduce((acc, it) => acc + it.tokensInput, 0);
  const totalTokensOutput = filteredByType.reduce((acc, it) => acc + it.tokensOutput, 0);
  const averageResponseTimeMs =
    totalInteractions > 0
      ? filteredByType.reduce((acc, it) => acc + it.responseTimeMs, 0) / totalInteractions
      : 0;

  return {
    summary: {
      totalInteractions,
      totalTokensInput,
      totalTokensOutput,
      averageResponseTimeMs,
    },
    interactions: filteredByType,
  };
}


/** =====================================================================
 *  PAGE
 *  ===================================================================== */
export function UserChatMetricsPage() {
  const { darkMode } = useTheme();

  // Use local-safe today (prevents UTC off-by-one issues on date inputs)
  const today = todayLocal();

  // View state (will remain here even after integration)
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [chatFilter, setChatFilter] = useState<ChatFilter>("ALL");
  const [compare, setCompare] = useState(false);
  
  // MOCK status toggler (Phase F: replace with DataStatus from useChatMetrics)
  const [mockMode, setMockMode] = useState<MockMode>("ON");
  const cycleMockMode = () => {
    setMockMode((prev) => {
      if (prev === "ON") return "EMPTY";
      if (prev === "EMPTY") return "ERROR";
      if (prev === "ERROR") return "LOADING";
      return "ON";
    });
  };

  /**
   * Data source (MOCK ONLY)
   * Integration note:
   *   - Replace `buildMockMetrics()` with `useChatMetrics({ startDate, endDate, filter })`
   *   - `useChatMetrics` should return: { status, interactions, series, kpis }
   */
  const metrics = useMemo(() => {
    if (mockMode === "EMPTY" || mockMode === "ERROR" || mockMode === "LOADING") {
      return EMPTY_METRICS;
    }
    return buildMockMetrics(startDate, chatFilter);
  }, [startDate, chatFilter, mockMode]);

  const { interactions } = metrics;
  const filtered = interactions;

  /**
   * Map MOCK row shape -> app Interaction shape for selectors/charts
   * Integration note:
   *   - When you fetch from API, return this shape directly (TypedInteraction)
   *     to avoid this mapping at the page level.
   */
  const typedForSeries = useMemo<TypedInteraction[]>(
    () =>
      filtered.map((it) => ({
        interactionId: it.interactionId,
        timestamp: it.timestamp,
        sessionId: it.sessionId,
        chatType: it.chatFilter === "FREE" ? "FREE" : "CONTEXT",
        tokensInput: it.tokensInput,
        tokensOutput: it.tokensOutput,
        responseTimeMs: it.responseTimeMs,
        userMessage: it.userMessage,
        assistantMessage: it.assistantMessage,
        ideaId: it.ideaId ?? null,
      })),
    [filtered]
  );

    /**
   * Derived series & KPIs (pure/predictable)
   * Integration note:
   *   - If you build a `useChatMetrics` hook, it can expose `series` and `kpis`
   *     so the page becomes pure composition.
   */
  const series = useMemo(() => buildHourlySeries(typedForSeries), [typedForSeries]);
  const { totalInput, totalOutput, totalAll, avgRt, p50, p95, avgTokensPerInteraction } = useMemo(
    () => computeKpis(typedForSeries),
    [typedForSeries]
  );

  // UI status flags from MOCK mode
  const isError = mockMode === "ERROR";
  const isLoading = mockMode === "LOADING";

  // Theme utility classes
  const theme = useMemo(
    () => ({
      pageBg: darkMode ? "bg-slate-950" : "bg-slate-50/40",
      textBase: darkMode ? "text-slate-100" : "text-gray-900",
      cardBase: darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200",
      muted: darkMode ? "text-slate-400" : "text-gray-500",
    }),
    [darkMode]
  );

  const showCompare = chatFilter === "ALL" && compare;

  const singleColor =
    chatFilter === "FREE" ? SERIES_COLORS.FREE :
    chatFilter === "CONTEXT" ? SERIES_COLORS.CONTEXT :
    SERIES_COLORS.ALL;

  const singleColorSecondary =
    chatFilter === "FREE" ? SERIES_COLORS.FREE_OUT :
    chatFilter === "CONTEXT" ? SERIES_COLORS.CTX_OUT :
    SERIES_COLORS.ALL_OUT;

  return (
    <main className={cn("min-h-screen", theme.pageBg, theme.textBase)}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn("text-sm uppercase tracking-wide", darkMode ? "text-slate-500" : "text-gray-400")}>
              Usage
            </p>
            <h1 className="text-2xl font-semibold">Minhas métricas de uso da Aiko Ai</h1>
            <p className={cn("mt-2 text-sm md:text-base", theme.muted)}>
              Veja o resumo das suas interações para o período selecionado, incluindo tokens, tempo de resposta e
              histórico de mensagens.
            </p>
          </div>

          <ChatMetricsFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(v) => {
              setStartDate(v);
              if (endDate < v) setEndDate(v);
            }}
            onEndDateChange={setEndDate}
            chatFilter={chatFilter}
            onChatFilterChange={setChatFilter}
            compare={compare}
            onToggleCompare={() => setCompare((v) => !v)}
            mockMode={mockMode}
            onCycleMock={cycleMockMode}
            darkMode={darkMode}
          />
        </header>

        {/* Error / Loading */}
        {isError && (
          <div 
            className={cn(
              "mb-6 rounded-xl", darkMode
                ? "border border-red-900 bg-red-800 p-4 text-red-50"
                : "border border-red-300 bg-red-50 p-4 text-red-700"
            )}
          >
            Não foi possível carregar as métricas agora. Tente novamente mais tarde.
          </div>
        )}
        {isLoading && (
          <div className={cn("mb-6 animate-pulse rounded-xl border p-6", theme.cardBase, theme.muted)}>
            Loading metrics…
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* KPIs */}
            {!!filtered.length && (
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ChatKpiCard title="Total Interactions" value={formatInt(filtered.length)} subtitle={`${startDate} → ${endDate}`} icon={MessageSquareText} />
                <ChatKpiCard title="Tokens (Input → Output)" value={`${formatInt(totalInput)} → ${formatInt(totalOutput)}`} subtitle={`Total: ${formatInt(totalAll)}`} icon={Gauge} />
                <ChatKpiCard title="Avg Response Time" value={formatMs(avgRt)} subtitle={`p50: ${formatMs(p50)} • p95: ${formatMs(p95)}`} icon={Clock} />
                <ChatKpiCard title="Avg Tokens/Interaction" value={formatInt(Math.round(avgTokensPerInteraction))} subtitle="Input + Output por interação" icon={Cpu} />
              </section>
            )}

            {/* Charts */}
            {!!filtered.length && (
              <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Interactions per hour */}
                <div className={cn("rounded-2xl border p-4", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">Interactions per Hour</h3>
                  <div className="h-64">
                    <InteractionsByHourChart 
                      data={series}
                      compare={showCompare}
                      dark = {darkMode}
                      colors={SERIES_COLORS}
                      singleColor={singleColorSecondary}
                    />
                  </div>
                </div>

                {/* Tokens by Hour */}
                <div className={cn("rounded-2xl border p-4", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">Tokens by Hour</h3>
                  <div className="h-64">
                    <TokensByHourChart
                      data={series}
                      compare={compare}
                      dark={darkMode}
                      colors={SERIES_COLORS}
                      singleColor={singleColor}
                      singleColorSecondary={singleColorSecondary}
                    />
                  </div>
                </div>

                {/* Latency */}
                <div className={cn("rounded-2xl border p-4 lg:col-span-2", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">Avg Response Time (ms) by Hour</h3>
                  <div className="h-64">
                    <LatencyByHourChart
                      data={series}
                      compare={showCompare}
                      dark={darkMode}
                      colors={SERIES_COLORS}
                      singleColor={singleColor}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Filtros (2ª barra) */}
            <div className="mb-3">
              <ChatMetricsFilters
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(v) => {
                  setStartDate(v);
                  if (endDate < v) setEndDate(v);
                }}
                onEndDateChange={setEndDate}
                chatFilter={chatFilter}
                onChatFilterChange={setChatFilter}
                compare={compare}
                onToggleCompare={() => setCompare((v) => !v)}
                mockMode={mockMode}
                onCycleMock={cycleMockMode}
                darkMode={darkMode}
              />
            </div>

            {/* Table of Interactions */}
            <section className={cn("rounded-2xl border", theme.cardBase)}>
              <ChatMetricsTable
                items={filtered}
                dark={darkMode}
                scopeLabel={chatFilter === "ALL" ? "ALL" : chatFilter}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
