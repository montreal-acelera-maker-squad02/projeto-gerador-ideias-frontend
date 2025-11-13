import { cn } from "@/lib/utils";
import { SlidersHorizontal, Cpu } from "lucide-react";
import type { ChatFilter } from "@/types/chatMetrics";

export type MockMode = "ON" | "EMPTY" | "ERROR" | "LOADING";

export type ChatMetricsFiltersProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  chatFilter: ChatFilter;
  onChatFilterChange: (v: ChatFilter) => void;
  compare: boolean;
  onToggleCompare: () => void;
  mockMode: MockMode;
  onCycleMock: () => void;
  darkMode: boolean;
  /** Admin Search Bar (e.g. username / email) */
  query?: string;
  onQueryChange?: (v: string) => void;
  queryPlaceholder?: string;
};

export default function ChatMetricsFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  chatFilter,
  onChatFilterChange,
  compare,
  onToggleCompare,
  mockMode,
  onCycleMock,
  darkMode,
  query,
  queryPlaceholder,
  onQueryChange,
}: Readonly<ChatMetricsFiltersProps>) {
  const mockLabel = `Mock: ${mockMode}`;
  const isError = mockMode === "ERROR";
  const isLoading = mockMode === "LOADING";

  const baseCard = darkMode
    ? "border-slate-700 bg-slate-900"
    : "border-gray-200 bg-white";
  const hoverCard = darkMode ? "hover:bg-slate-800" : "hover:bg-gray-50";

  const showSearch = typeof onQueryChange === "function";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Período */}
      <span className="basis-full h-0 p-0 m-0" aria-hidden="true" />
      <label
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm w-fit",
          baseCard
        )}
      >
        <input
          type="date"
          aria-label="Data inicial"
          className={cn(
            "bg-transparent outline-none",
            darkMode ? "text-slate-50" : "text-gray-900"
          )}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <span className={darkMode ? "text-slate-500" : "text-gray-400"}>—</span>
        <input
          type="date"
          aria-label="Data final"
          className={cn(
            "bg-transparent outline-none",
            darkMode ? "text-slate-50" : "text-gray-900"
          )}
          value={endDate}
          min={startDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </label>
      <span className="basis-full h-0 p-0 m-0" aria-hidden="true" />

      {/* Segmented control */}
      <div
        className={cn("inline-flex gap-1 rounded-xl p-1 text-sm", baseCard)}
        role="group"
        aria-label="Filtro de tipo de chat"
      >
        {(["ALL", "FREE", "CONTEXT"] as ChatFilter[]).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={chatFilter === type}
            onClick={() => onChatFilterChange(type)}
            className={
              chatFilter === type
                ? cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    darkMode
                      ? "bg-slate-50 text-slate-900"
                      : "bg-gray-900 text-white"
                  )
                : cn(
                    "rounded-lg px-3 py-1.5 text-xs",
                    darkMode
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-gray-500 hover:bg-gray-50"
                  )
            }
          >
            {type === "ALL"
              ? "Todos"
              : type === "FREE"
              ? "Livres"
              : "Com contexto"}
          </button>
        ))}
      </div>

      {(() => {
        const canCompare = chatFilter === "ALL";
        return (
          <button
            onClick={canCompare ? onToggleCompare : undefined}
            aria-pressed={canCompare ? compare : undefined}
            aria-hidden={canCompare ? undefined : true}
            tabIndex={canCompare ? 0 : -1}
            disabled={!canCompare}
            aria-label="Alternar modo de comparação"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
              canCompare
                ? compare
                  ? darkMode
                    ? "bg-slate-50 text-slate-900"
                    : "bg-gray-900 text-white"
                  : cn(baseCard, hoverCard)
                : // keep layout: invisible and non-interactive when not applicable
                  "invisible pointer-events-none"
            )}
            title={canCompare ? "Overlay FREE vs CONTEXT on charts" : undefined}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {compare ? "Compare ON" : "Compare OFF"}
          </button>
        );
      })()}

      {/* Search (opcional, p.ex. username / email) */}
      {showSearch && (
        <div className="flex-1 min-w-[200px]">
          <input
            value={query ?? ""}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder={queryPlaceholder ?? "Buscar por usuário ou e-mail…"}
            aria-label="Buscar por usuário ou e-mail"
            className={cn(
              "w-full rounded-xl border px-3 py-2 text-sm outline-none",
              darkMode
                ? "border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-500"
                : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
              "focus:ring-2 focus:ring-offset-0",
              darkMode ? "focus:ring-slate-500" : "focus:ring-gray-300"
            )}
          />
        </div>
      )}

      {/* Mock modes */}
      <button
        onClick={onCycleMock}
        aria-label="Alternar modo de mock"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border",
          isError
            ? "border-red-300 bg-red-50 text-red-700"
            : isLoading
            ? cn(baseCard, darkMode ? "text-slate-100" : "text-gray-900")
            : cn(baseCard, hoverCard)
        )}
        title="Cycle mock mode"
      >
        <Cpu className="h-4 w-4" /> {mockLabel}
      </button>
    </div>
  );
}
