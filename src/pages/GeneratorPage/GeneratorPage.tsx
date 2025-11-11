import React, { useCallback, useMemo, useState } from "react";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import StatsCardWithIcon from "@/components/StatsCard/StatsCardWithIcon";
import { Lightbulb, Clock, Star, ChevronDown, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import IdeaResultCard from "@/components/IdeiaCard/IdeaResultCard";
import { ChatWidget } from "@/components/ChatWidget/ChatWidget";
import AutoResizeTextarea from "@/components/AutoResizeTextarea/AutoResizeTextarea";
import { useTheme } from "@/hooks/useTheme";
import { emitHistoryRefreshRequest } from "@/events/historyEvents";

const themeOptions = [
  "Tecnologia",
  "Educacao",
  "Marketing",
  "Viagem",
  "Saude",
  "Negocio",
  "Arte",
  "Sustentabilidade",
  "Gaming",
  "Musica",
];

const sampleIdeas: Record<string, string[]> = {
  Tecnologia: [
    "IA que aprende com cada usuário e se adapta ao estilo de trabalho individual",
    "Plataforma de código aberto que permite criar assistentes de IA personalizados",
    "Sistema de backup quântico que protege dados contra qualquer tipo de falha",
  ],
  Educacao: [
    "App que gamifica o aprendizado com desafios e recompensas diárias",
    "Plataforma de mentoria onde alunos ensinam uns aos outros",
    "Tutor de IA que se adapta ao estilo de aprendizado de cada pessoa",
  ],
  Marketing: [
    "Ferramenta que gera campanhas virais baseada em tendências em tempo real",
    "Plataforma de influenciadores que conecta marcas com criadores micro",
    "Dashboard que prediz o sucesso de campanhas antes do lançamento",
  ],
  Viagem: [
    "App que conecta viajantes com moradores para experiências autênticas",
    "Guia de viagem inteligente que aprende suas preferências",
    "Plataforma de trocas de casa segura com verificação biométrica",
  ],
  Saude: [
    "Wearable que detecta doenças 6 meses antes dos sintomas",
    "App de meditação com VR para terapia personalizada",
    "Sistema de telemedicina que funciona offline com IA",
  ],
  Negocio: [
    "Marketplace onde IA faz orçamentos automáticos",
    "Plataforma de consultoria com CEOs juniores mentorados",
    "Seguro de crédito baseado em dados comportamentais",
  ],
  Arte: [
    "App para artistas colaborarem em tempo real online",
    "Galeria virtual imersiva com obras animadas",
    "Ferramenta que transforma sentimentos em arte abstrata",
  ],
  Sustentabilidade: [
    "App que calcula pegada de carbono em tempo real",
    "Marketplace de produtos sustentáveis com impacto social",
    "IA que otimiza rotas de entrega para reduzir emissões",
  ],
  Gaming: [
    "Motor de jogos que cria mundos procedurais infinitos",
    "Plataforma de eSports com IA anti-cheating",
    "Streaming de jogos com latência zero usando computação quântica",
  ],
  Musica: [
    "App que compõe música baseada em seu humor",
    "Plataforma de colaboração de música em tempo real",
    "IA que remixea suas músicas favoritas ao vivo",
  ],
};

const pickRandom = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const RANDOM_CONTEXTS = [
  "Inovação disruptiva",
  "Sustentabilidade",
  "Experiência do usuário",
  "Integração com IA",
  "Modelo escalável",
] as const;

const MAX_CONTEXT = 50;

export const GeneratorPage: React.FC = () => {
  const { darkMode } = useTheme(); // ✅ pega o modo escuro do contexto
  const [themes, setThemes] = useState<Theme[]>([]);
  const [theme, setTheme] = useState("");
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const toggleThemeDropdown = useCallback(() => {
    setShowThemeDropdown((prev) => !prev);
  }, []);

  // 🔄 Carrega temas da API
  useEffect(() => {
    async function loadThemes() {
      try {
        const data = await themeService.getAll();
        setThemes(data);
      } catch (err) {
        console.error("Erro ao carregar temas:", err);
      }
    }
    loadThemes();
  }, []);

  const favoriteIdeas = useMemo(() => ideas.filter(i => i.isFavorite), [ideas]);

  const averageResponseTime = useMemo(() => {
    if (ideas.length === 0) return 0;
    const sum = ideas.reduce((acc, i) => acc + (i.responseTime || 0), 0);
    return Math.round(sum / ideas.length);
  }, [ideas]);

  const generateIdea = async (themeOverride?: string, contextOverride?: string) => {
    const themeToUse = themeOverride ?? theme;
    const contextToUse = contextOverride ?? context;

    if (!themeToUse.trim() || !contextToUse.trim() || isLoading) return;

    setIsLoading(true);
    const startTime = Date.now();

    const ideaList = sampleIdeas[themeToUse] || sampleIdeas["Tecnologia"];
    const randomIdea = pickRandom(ideaList);
    const responseTime = Date.now() - startTime;

    await new Promise(r => setTimeout(r, 800));

    const newIdea: Idea = {
      id: String(Date.now()),
      theme: themeToUse,
      context: contextToUse,
      content: randomIdea,
      timestamp: new Date(),
      isFavorite: false,
      responseTime,
    };

    setCurrentIdea(newIdea);
    setIdeas(prev => [newIdea, ...prev]);
    setIsLoading(false);
  };

  const themeLabel = theme || "Escolha o tema";
  const themeToneClass = theme
    ? darkMode
      ? "text-blue-300"
      : "text-blue-600"
    : darkMode
      ? "text-slate-400"
      : "text-gray-500";

  const renderThemeButton = ({
    buttonClassName,
    labelClassName,
    iconClassName,
  }: {
    buttonClassName: string;
    labelClassName: string;
    iconClassName: string;
  }) => (
    <button
      className={cn(
        "flex items-center gap-2 rounded-lg transition-all",
        buttonClassName
      )}
      onClick={toggleThemeDropdown}
    >
      <span className={cn(labelClassName, themeToneClass)}>{themeLabel}</span>
      <ChevronDown
        className={cn(
          iconClassName,
          "transition-transform",
          showThemeDropdown && "rotate-180",
          themeToneClass
        )}
      />
    </button>
  );

  const getDropdownOptionClass = (isActive: boolean) => {
    if (isActive) {
      return darkMode
        ? "bg-blue-500/10 text-blue-200"
        : "bg-blue-50 text-blue-600";
    }
    return darkMode
      ? "text-slate-100 hover:bg-slate-800/60"
      : "text-gray-700 hover:bg-gray-50";
  };

  const surpriseMe = async () => {
    const t = pickRandom(themes.length ? themes.map(th => th.name) : ["Tecnologia"]);
    const c = pickRandom(RANDOM_CONTEXTS);
    setTheme(t);
    setContext(c);
    await generateIdea(t, c);
  };

  const toggleFavorite = (id: string) => {
    setIdeas(prev => prev.map(i => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i)));
    setCurrentIdea(prev => (prev?.id === id ? { ...prev, isFavorite: !prev.isFavorite } : prev));
  };

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
                      {theme || "Escolha o tema"}
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
                        {themes.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.name);
                              setShowThemeDropdown(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg transition-all text-sm font-light",
                              theme === t.name
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

                {/* Campo de texto */}
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

            {/* Botões */}
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <button
                onClick={() => generateIdea()}
                disabled={!theme.trim() || !context.trim() || isLoading}
                className={cn(
                  "px-10 py-4 rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  darkMode
                    ? "bg-linear-to-r from-purple-700 to-blue-800 text-white"
                    : "bg-linear-to-r from-purple-500 to-blue-600 text-white"
                )}
              >
                {isLoading ? "Gerando..." : "Gerar Ideia"}
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

      <ChatWidget />
      <AppFooter />
    </div>
  );
};
