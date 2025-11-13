import { useMemo, useState } from "react";
import { MessageSquareText, Gauge, Clock, Cpu } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import ChatKpiCard from "@/components/StatsCard/ChatKpiCard";
import {
  InteractionsByHourChart,
  TokensByHourChart,
  LatencyByHourChart,
} from "@/components/charts";
import type {
  ChatFilter,
  Interaction as TypedInteraction,
} from "@/types/chatMetrics";
import { SERIES_COLORS } from "@/types/chatMetrics";
import { formatMs, formatInt, todayLocal } from "@/utils/format";
import { buildHourlySeries, computeKpis } from "@/utils/chatbot_metrics";
import ChatMetricsFilters from "@/components/ChatMetricsFilters/ChatMetricsFilters";
import ChatMetricsTable from "@/components/ChatMetricsTable/ChatMetricsTable";

/**
 * ========================================================================================
 * TYPES (LOCAL, MOCK-ONLY)
 * ========================================================================================
 */
type AdminRowInteraction = {
  interactionId: number;
  timestamp: string; // ISO
  sessionId: number;
  chatFilter: ChatFilter;
  tokensInput: number;
  tokensOutput: number;
  responseTimeMs: number;
  userMessage: string;
  assistantMessage: string;
  ideaId?: number | null;

  userName: string;
  userEmail: string;
};

type DailyAdminMetricsData = {
  summary: {
    totalInteractions: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    averageResponseTimeMs: number;
  };
  interactions: AdminRowInteraction[];
};

/**
 * ========================================================================================
 * MOCK STATUS (LOCAL ONLY)
 * ========================================================================================
 */
type MockMode = "ON" | "EMPTY" | "ERROR" | "LOADING";

/**
 * ========================================================================================
 * MOCK DATA (LOCAL ONLY)
 * ========================================================================================
 */
const EMPTY_METRICS: DailyAdminMetricsData = {
  summary: {
    totalInteractions: 0,
    totalTokensInput: 0,
    totalTokensOutput: 0,
    averageResponseTimeMs: 0,
  },
  interactions: [],
};

function buildMockAdminMetrics(
  startDate: string,
  chatFilter: ChatFilter
): DailyAdminMetricsData {
  const baseInteractions: AdminRowInteraction[] = [
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
      userName: "Ana Souza",
      userEmail: "ana.souza@example.com",
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
      userName: "Carlos Lima",
      userEmail: "carlos.lima@example.com",
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
      userName: "Ana Souza",
      userEmail: "ana.souza@example.com",
    },
  ];

  const filteredByType =
    chatFilter === "ALL"
      ? baseInteractions
      : baseInteractions.filter((i) => i.chatFilter === chatFilter);

  const totalInteractions = filteredByType.length;
  const totalTokensInput = filteredByType.reduce(
    (acc, it) => acc + it.tokensInput,
    0
  );
  const totalTokensOutput = filteredByType.reduce(
    (acc, it) => acc + it.tokensOutput,
    0
  );
  const averageResponseTimeMs =
    totalInteractions > 0
      ? filteredByType.reduce((acc, it) => acc + it.responseTimeMs, 0) /
        totalInteractions
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
export function AdminChatMetricsPage() {
  const { darkMode } = useTheme();

  const today = todayLocal();

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [chatFilter, setChatFilter] = useState<ChatFilter>("ALL");
  const [compare, setCompare] = useState(false);
  const [search, setSearch] = useState("");

  const [mockMode, setMockMode] = useState<MockMode>("ON");
  const cycleMockMode = () => {
    setMockMode((prev) => {
      if (prev === "ON") return "EMPTY";
      if (prev === "EMPTY") return "ERROR";
      if (prev === "ERROR") return "LOADING";
      return "ON";
    });
  };

  const metrics = useMemo(() => {
    if (
      mockMode === "EMPTY" ||
      mockMode === "ERROR" ||
      mockMode === "LOADING"
    ) {
      return EMPTY_METRICS;
    }
    return buildMockAdminMetrics(startDate, chatFilter);
  }, [startDate, chatFilter, mockMode]);

  const { interactions } = metrics;
  const normalizedQuery = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return interactions;

    return interactions.filter((it) => {
      const name = (it.userName ?? "").toLowerCase();
      const email = (it.userEmail ?? "").toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [interactions, normalizedQuery]);

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

  const series = useMemo(
    () => buildHourlySeries(typedForSeries),
    [typedForSeries]
  );

  const {
    totalInput,
    totalOutput,
    totalAll,
    avgRt,
    p50,
    p95,
    avgTokensPerInteraction,
  } = useMemo(() => computeKpis(typedForSeries), [typedForSeries]);

  const isError = mockMode === "ERROR";
  const isLoading = mockMode === "LOADING";

  const theme = useMemo(
    () => ({
      pageBg: darkMode ? "bg-slate-950" : "bg-slate-50/40",
      textBase: darkMode ? "text-slate-100" : "text-gray-900",
      cardBase: darkMode
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-200",
      muted: darkMode ? "text-slate-400" : "text-gray-500",
    }),
    [darkMode]
  );

  const showCompare = chatFilter === "ALL" && compare;

  const singleColor =
    chatFilter === "FREE"
      ? SERIES_COLORS.FREE
      : chatFilter === "CONTEXT"
      ? SERIES_COLORS.CONTEXT
      : SERIES_COLORS.ALL;

  const singleColorSecondary =
    chatFilter === "FREE"
      ? SERIES_COLORS.FREE_OUT
      : chatFilter === "CONTEXT"
      ? SERIES_COLORS.CTX_OUT
      : SERIES_COLORS.ALL_OUT;

  return (
    <main className={cn("min-h-screen", theme.pageBg, theme.textBase)}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={cn(
                "text-sm uppercase tracking-wide",
                darkMode ? "text-slate-500" : "text-gray-400"
              )}
            >
              Admin • Usage
            </p>
            <h1 className="text-2xl font-semibold">
              Métricas de uso da Aiko IA para todos os usuários
            </h1>
            <p className={cn("mt-2 text-sm md:text-base", theme.muted)}>
              Acompanhe as interações de todos os usuários por período,
              incluindo tokens, tempo de resposta e detalhes de cada conversa.
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
              "mb-6 rounded-xl",
              darkMode
                ? "border border-red-900 bg-red-800 p-4 text-red-50"
                : "border border-red-300 bg-red-50 p-4 text-red-700"
            )}
          >
            Não foi possível carregar as métricas agora. Tente novamente mais
            tarde.
          </div>
        )}

        {isLoading && (
          <div
            className={cn(
              "mb-6 animate-pulse rounded-xl border p-6",
              theme.cardBase,
              theme.muted
            )}
          >
            Loading metrics…
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* KPIs */}
            {!!filtered.length && (
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ChatKpiCard
                  title="Total Interactions"
                  value={formatInt(filtered.length)}
                  subtitle={`${startDate} → ${endDate}`}
                  icon={MessageSquareText}
                />
                <ChatKpiCard
                  title="Tokens (Input → Output)"
                  value={`${formatInt(totalInput)} → ${formatInt(totalOutput)}`}
                  subtitle={`Total: ${formatInt(totalAll)}`}
                  icon={Gauge}
                />
                <ChatKpiCard
                  title="Avg Response Time"
                  value={formatMs(avgRt)}
                  subtitle={`p50: ${formatMs(p50)} • p95: ${formatMs(p95)}`}
                  icon={Clock}
                />
                <ChatKpiCard
                  title="Avg Tokens/Interaction"
                  value={formatInt(Math.round(avgTokensPerInteraction))}
                  subtitle="Input + Output por interação"
                  icon={Cpu}
                />
              </section>
            )}

            {/* Charts */}
            {!!filtered.length && (
              <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Interactions per hour */}
                <div className={cn("rounded-2xl border p-4", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">
                    Interactions per Hour
                  </h3>
                  <div className="h-64">
                    <InteractionsByHourChart
                      data={series}
                      compare={showCompare}
                      dark={darkMode}
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
                <div
                  className={cn(
                    "rounded-2xl border p-4 lg:col-span-2",
                    theme.cardBase
                  )}
                >
                  <h3 className="mb-2 text-sm font-medium">
                    Avg Response Time (ms) by Hour
                  </h3>
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

            {/* 2nd filters bar */}
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
                query={search}
                onQueryChange={setSearch}
                queryPlaceholder="Buscar por usuário ou e-mail…"
              />
            </div>

            {/* Table of Interactions with user columns */}
            <section className={cn("rounded-2xl border", theme.cardBase)}>
              <ChatMetricsTable
                items={filtered}
                dark={darkMode}
                scopeLabel={chatFilter === "ALL" ? "ALL" : chatFilter}
                showUserColumns
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
