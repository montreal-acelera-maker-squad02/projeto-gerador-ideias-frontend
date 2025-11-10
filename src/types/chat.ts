export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string | Date | null;
};

export type ChatIdeaSummary = {
  ideaId: string;
  title: string;
  summary: string;
  createdAt?: string | null;
};

