// src/pages/ChatMetricsPage/ChatMetricsGate.tsx
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { UserChatMetricsPage } from "./UserChatMetricPage";
import { AdminChatMetricsPage } from "./AdminChatMetricsPage";

type Role = "USER" | "ADMIN";
type GateStatus = "loading" | "ready" | "error";

export function ChatMetricsGate() {
  const { darkMode } = useTheme();
  const [status, setStatus] = useState<GateStatus>("loading");
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    // 🔧 INTEGRAÇÃO VAI ENTRAR AQUI
    // Hoje: stub usando localStorage só pra ter um comportamento previsível.
    // - Defina localStorage.setItem("mockChatMetricsRole", "ADMIN" | "USER")
    //   para testar os dois fluxos.
    const resolveRole = async () => {
      try {
        // 👉 Trocar este bloco por chamada real, ex.:
        // const session = await authService.getSession();
        // setRole(session.isAdmin ? "ADMIN" : "USER");

        const stored = globalThis.localStorage.getItem("mockChatMetricsRole");
        if (stored === "ADMIN" || stored === "USER") {
          setRole(stored);
        } else {
          // comportamento default: usuário normal
          setRole("USER");
        }

        setStatus("ready");
      } catch (err) {
        console.error("[ChatMetricsGate] Failed to resolve role", err);
        setStatus("error");
      }
    };

    void resolveRole();
  }, []);

  // ✅ Quando já souber o papel, delega direto para a página correta
  if (status === "ready" && role === "ADMIN") {
    return <AdminChatMetricsPage />;
  }

  if (status === "ready" && role === "USER") {
    return <UserChatMetricsPage />;
  }

  // 🎛 Estilos base para os estados intermediários
  const pageBg = darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/40 text-gray-900";
  const cardBase = darkMode
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-gray-200";
  const muted = darkMode ? "text-slate-400" : "text-gray-500";

  // ⏳ Loading state
  if (status === "loading") {
    return (
      <main className={cn("min-h-screen flex items-center justify-center px-4", pageBg)}>
        <div className={cn("flex items-center gap-3 rounded-2xl border px-5 py-4", cardBase)}>
          <div
            className={cn(
              "h-5 w-5 rounded-full border-2 border-t-transparent animate-spin",
              darkMode ? "border-slate-500" : "border-gray-400"
            )}
            aria-hidden="true"
          />
          <div className="text-sm">
            <div className="font-medium">Verificando permissões…</div>
            <div className={cn("text-xs", muted)}>
              Carregando suas métricas do chatbot.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ❌ Error state
  if (status === "error") {
    return (
      <main className={cn("min-h-screen flex items-center justify-center px-4", pageBg)}>
        <div className={cn("max-w-md rounded-2xl border p-6 text-center", cardBase)}>
          <div className="mb-3 text-3xl">⚠️</div>
          <h1 className="mb-2 text-lg font-semibold">
            Não foi possível verificar seu acesso
          </h1>
          <p className={cn("text-sm", muted)}>
            Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </main>
    );
  }

  // fallback defensivo (não deveria chegar aqui)
  return null;
}
