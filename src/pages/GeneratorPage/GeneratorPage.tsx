import React, { useEffect, useMemo, useState } from "react";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import StatsCardWithIcon from "@/components/StatsCard/StatsCardWithIcon";
import { Lightbulb, Clock, Star, ChevronDown, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import IdeaResultCard from "@/components/IdeiaCard/IdeaResultCard";
import { ChatWidget } from "@/components/ChatWidget/ChatWidget";
import AutoResizeTextarea from "@/components/AutoResizeTextarea/AutoResizeTextarea";
import { themeService, type Theme } from "@/services/themeService";
import { useTheme } from "@/hooks/useTheme";
import { ideaService } from "@/services/ideaService";

const MAX_CONTEXT = 50;

type GeneratorPageProps = {
  defaultContext?: string;
  initialIdeas?: Idea[];
  initialCurrentIdea?: Idea | null;
  disableChatWidget?: boolean;
};

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  defaultContext = "",
  initialIdeas = [],
  initialCurrentIdea = null,
  disableChatWidget = false,
}) => {
  const { darkMode } = useTheme();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [theme, setTheme] = useState<number | null>(null);
  const [context, setContext] = useState(defaultContext);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(
    initialCurrentIdea ?? initialIdeas[0] ?? null
  );
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // 🔄 Carrega temas da API
  useEffect(() => {
    async function loadThemes() {
      try {
        const data = await themeService.getAll();
        setThemes(data);
      } catch (err) {
        console.error("Erro ao carregar temas:", err);
        setError("Não foi possível carregar os temas.");
      }
    }
    loadThemes();
  }, []);

  useEffect(() => {
    setHasGenerated(false);
  }, [theme, context]);

  const favoriteIdeas = useMemo(() => ideas.filter(i => i.isFavorite), [ideas]);

  const averageResponseTime = useMemo(() => {
    if (ideas.length === 0) return 0;
    const validTimes = ideas.map(i => i.responseTime || 0).filter(t => t > 0);
    if (validTimes.length === 0) return 0;
    const sum = validTimes.reduce((acc, i) => acc + i, 0);
    return Math.round(sum / validTimes.length);
  }, [ideas]);

  const generateIdea = async (themeIdOverride?: number, contextOverride?: string) => {
    const themeIdToUse = themeIdOverride ?? theme;
    const contextToUse = contextOverride ?? context;

    if (!themeIdToUse || !contextToUse.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const isSurprise = !!themeIdOverride;
    const skipCache = hasGenerated || isSurprise;

    try {
      const newIdea = await ideaService.generateIdea(
        themeIdToUse,
        contextToUse,
        skipCache
      );

      setCurrentIdea(newIdea);
      setIdeas(prev => [newIdea, ...prev]);
      setHasGenerated(true);
    } catch (err: any) {
      console.error("Falha ao gerar ideia:", err);
      setError(err.message || "Não foi possível gerar a ideia. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const surpriseMe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newIdea = await ideaService.generateSurpriseIdea();

      setCurrentIdea(newIdea);
      setIdeas(prev => [newIdea, ...prev]);

      const themeLabel = (newIdea.theme || "").toLowerCase();
      const matchedTheme = themes.find(opt => (opt.name || "").toLowerCase() === themeLabel);
      
      setTheme(matchedTheme?.id ?? null);
      setContext(newIdea.context || "");

    } catch (err: any) {
      console.error("Falha ao gerar ideia surpresa:", err);
      setError(err.message || "Não foi possível gerar a ideia. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;

    const newIsFavorite = !idea.isFavorite;

    setIdeas(prev => prev.map(i => (i.id === id ? { ...i, isFavorite: newIsFavorite } : i)));
    setCurrentIdea(prev => (prev?.id === id ? { ...prev, isFavorite: newIsFavorite } : prev));

    try {
      await ideaService.toggleFavorite(String(id), newIsFavorite);
    } catch (err) {
      console.error("Erro ao (des)favoritar:", err);
      setIdeas(prev => prev.map(i => (i.id === id ? { ...i, isFavorite: !newIsFavorite } : i)));
      setCurrentIdea(prev => (prev?.id === id ? { ...prev, isFavorite: !newIsFavorite } : prev));
    }
  };

  const selectedThemeLabel = useMemo(() => {
    return themes.find(opt => opt.id === theme)?.name || "Escolha o tema";
  }, [theme, themes]);

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col relative transition-colors duration-300",
        darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-gray-900"
      )}
    >
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-72 pointer-events-none z-0 bg-linear-to-b to-transparent",
          darkMode
            ? "from-slate-800/60 via-slate-900/40"
            : "from-blue-100/40 via-purple-100/30"
        )}
      />

      <main className="flex-1">
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">

          {/* === HERO / FORM === */}
          <SectionContainer
            className={cn(
              "relative z-30 mb-16 p-8 rounded-2xl border shadow-md animate-fadeInUp",
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-300"
            )}
          >
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                Transforme suas ideias em realidade
              </h1>
              <p
                className={cn(
                  "text-base font-light",
                  darkMode ? "text-slate-300" : "text-gray-600"
                )}
              >
                Gere ideias criativas com inteligência artificial
              </p>
            </div>

            {/* Input + Seleção de Tema */}
            <div
              className={cn(
                "px-6 py-4 border-2 rounded-2xl relative transition-all",
                darkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-gray-300 bg-white"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Seletor de tema */}
                <div className="relative">
                  <button
                    onClick={() => setShowThemeDropdown(v => !v)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:opacity-80"
                  >
                    <span
                      className={cn(
                        "text-base font-light",
                        theme
                          ? darkMode
                            ? "text-blue-400"
                            : "text-blue-600"
                          : darkMode
                          ? "text-slate-400"
                          : "text-gray-500"
                      )}
                    >
                      {selectedThemeLabel}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform",
                        showThemeDropdown && "rotate-180",
                        theme
                          ? darkMode
                            ? "text-blue-400"
                            : "text-blue-600"
                          : darkMode
                          ? "text-slate-400"
                          : "text-gray-500"
                      )}
                    />
                  </button>

                  {showThemeDropdown && (
                    <div
                      className={cn(
                        "absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg border overflow-hidden z-50",
                        darkMode
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-gray-300"
                      )}
                    >
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {themes.length === 0 && (
                          <span className={cn("block text-center px-4 py-2 text-sm", darkMode ? "text-slate-400" : "text-gray-500")}>
                            Carregando temas...
                          </span>
                        )}
                        {themes.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id ?? null);
                              setShowThemeDropdown(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg transition-all text-sm font-light",
                              theme === t.id
                                ? darkMode
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-blue-50 text-blue-600"
                                : darkMode
                                ? "text-slate-300 hover:bg-slate-700"
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div
                  className={cn(
                    "w-px h-8 hidden sm:block",
                    darkMode ? "bg-slate-700" : "bg-gray-300"
                  )}
                />

                <div className="relative flex-1">
                  <AutoResizeTextarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    maxChars={MAX_CONTEXT}
                    placeholder="Descreva o contexto ou desafio..."
                    className={cn(
                      "w-full bg-transparent outline-none text-base font-light pr-9 placeholder:font-light",
                      darkMode
                        ? "text-slate-100 placeholder:text-slate-500"
                        : "text-gray-900 placeholder:text-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "pointer-events-none hidden sm:inline absolute right-2 top-1/2 -translate-y-1/2 text-[10px]",
                      darkMode ? "text-slate-500" : "text-gray-400"
                    )}
                  >
                    {context.length}/{MAX_CONTEXT}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-center text-red-600 text-sm mt-4">{error}</p>
            )}

            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <button
                onClick={() => generateIdea()}
                disabled={!theme || !context.trim() || isLoading}
                className={cn(
                  "px-10 py-4 rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  darkMode
                    ? "bg-linear-to-r from-purple-700 to-blue-800 text-white"
                    : "bg-linear-to-r from-purple-500 to-blue-600 text-white"
                )}
              >
                {isLoading
                  ? "Gerando..."
                  : hasGenerated
                  ? "Gerar Outra Ideia"
                  : "Gerar Ideia"}
              </button>
              <button
                onClick={surpriseMe}
                disabled={isLoading}
                className={cn(
                  "px-8 py-3.5 rounded-lg border font-light text-base flex items-center gap-2 transition-all",
                  darkMode
                    ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                    : "border-gray-400 text-gray-700 hover:bg-gray-50"
                )}
              >
                <Shuffle className="w-5 h-5" />
                Surpreenda-me
              </button>
            </div>
          </SectionContainer>

          {/* === RESULTADO === */}
          <div className="animate-fadeInUp">
            <h2
              className={cn(
                "text-2xl font-light mb-6",
                darkMode ? "text-slate-100" : "text-gray-900"
              )}
            >
              Resultado
            </h2>
            {currentIdea ? (
              <IdeaResultCard
                idea={currentIdea}
                onToggleFavorite={toggleFavorite}
                onCopy={() => {}}
                onShare={() => {}}
              />
            ) : (
              <SectionContainer
                className={cn(
                  "rounded-2xl p-12 text-center animate-fadeIn border",
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                )}
              >
                <p
                  className={cn(
                    "text-lg font-light",
                    darkMode ? "text-slate-300" : "text-gray-600"
                  )}
                >
                  Digite um tema e contexto para gerar sua primeira ideia criativa
                </p>
              </SectionContainer>
            )}
          </div>

          {/* === ESTATÍSTICAS === */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <StatsCardWithIcon title="Ideias geradas" value={ideas.length} Icon={Lightbulb} />
            <StatsCardWithIcon
              title="Tempo médio"
              value={
                <span>
                  {averageResponseTime}{" "}
                  <span
                    className={cn(
                      "text-lg font-light",
                      darkMode ? "text-slate-300" : "text-gray-500"
                    )}
                  >
                    ms
                  </span>
                </span>
              }
              Icon={Clock}
            />
            <StatsCardWithIcon title="Favoritas" value={favoriteIdeas.length} Icon={Star} />
          </div>
        </div>
      </main>

      {!disableChatWidget && <ChatWidget />}
    </div>
  );
};
