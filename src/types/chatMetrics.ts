export type ChatType = "FREE" | "CONTEXT";
export type ChatFilter = "ALL" | "FREE" | "CONTEXT";

export type Interaction = {
  interactionId: number;
  timestamp: string; // ISO
  sessionId: number;
  chatType: ChatType;
  tokensInput: number;
  tokensOutput: number;
  responseTimeMs: number;
  userMessage: string;
  assistantMessage: string;
  ideaId?: number | null;
};

export type DailyMetrics = {
  summary: {
    totalInteractions: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    averageResponseTimeMs: number;
  };
  interactions: Interaction[];
};

export type DataStatus = "ready" | "empty" | "error" | "loading";

export const SERIES_COLORS = {
  ALL: "#956eefff",   // purple 
  ALL_OUT: "#6366f1",
  FREE: "#3b82f6",  // blue
  FREE_OUT: "#60a5fa",
  CONTEXT: "#1ae4a0ff",// emerald
  CTX_OUT: "#179265ff",
};

