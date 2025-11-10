import React, { useMemo, useState } from "react";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import StatsCardWithIcon from "@/components/StatsCard/StatsCardWithIcon";
import { Lightbulb, Clock, Star, ChevronDown, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import IdeaResultCard from "@/components/IdeiaCard/IdeaResultCard";
import { AppHeader } from "@/components/Header/AppHeader";
import { AppFooter } from "@/components/Footer/AppFooter";
import { ChatWidget } from "@/components/ChatWidget/ChatWidget";
import AutoResizeTextarea from "@/components/AutoResizeTextarea/AutoResizeTextarea";

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


// helper (top-level or Utils)
const pickRandom = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

// keep this outside the function to avoid re-alloc each call
const RANDOM_CONTEXTS = [
  "Inovação disruptiva",
  "Sustentabilidade",
  "Experiência do usuário",
  "Integração com IA",
  "Modelo escalável",
] as const;

const MAX_CONTEXT = 50;

type GeneratorPageProps = {
  defaultTheme?: string
  defaultContext?: string
  initialIdeas?: Idea[]
  initialCurrentIdea?: Idea | null
  disableChatWidget?: boolean
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  defaultTheme = "",
  defaultContext = "",
  initialIdeas = [],
  initialCurrentIdea = null,
  disableChatWidget = false,
}) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [context, setContext] = useState(defaultContext);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(
    initialCurrentIdea ?? initialIdeas[0] ?? null
  );
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

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
    setIdeas((prev) => [newIdea, ...prev]);
    setIsLoading(false);
  };
  

  const surpriseMe = async () => {
    const t = pickRandom(themeOptions);
    const c = pickRandom(RANDOM_CONTEXTS);
    setTheme(t);
    setContext(c);
    await generateIdea(t, c);
  };

  const toggleFavorite = (id: string) => {
    setIdeas((prev) => 
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
    setCurrentIdea((prev) => 
      prev?.id === id ? { ...prev, isFavorite: !prev.isFavorite } : prev
    );
  };
    
  return (
     <div className="min-h-screen bg-white text-gray-900 flex flex-col relative">
      {/* Decorative gradient (light only for now) */}
      <div className="fixed top-0 left-0 right-0 h-72 pointer-events-none z-0 bg-gradient-to-b from-blue-100/40 via-purple-100/30 to-transparent" />
      
      <AppHeader />
      <main className="flex-1">
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">

          {/* Hero / Controls */}
          <SectionContainer className="relative z-30 mb-16 p-8 rounded-2xl border bg-white border-gray-300 shadow-md animate-fadeInUp">
            <div className="max-w-3xl mx-auto">
              <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">Transforme suas ideias em realidade</h1>
                <p className="text-base font-light text-gray-600">Gere ideias criativas com inteligência artificial</p>
              </div>

              {/* Prompt Row */}
              <div className="px-6 py-4 border-2 rounded-2xl transition-all relative border-gray-300 bg-white">
                {/* Mobile */}
                <div className="flex items-center justify-between gap-2 sm:hidden mb-2">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80 bg-white"
                    onClick={() => setShowThemeDropdown((v) => !v)}
                  >
                    <span
                      className={cn(
                        "text-sm font-light",
                        theme ? "text-blue-600" : "text-gray-500"
                      )}
                    >
                      {theme || "Escolha o tema"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        showThemeDropdown && "rotate-180",
                        theme ? "text-blue-600" : "text-gray-500"
                      )}
                    />
                  </button>

                  <span className="text-[10px] leading-none text-gray-400">
                    {context.length}/{MAX_CONTEXT}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                  {/* Desktop */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:opacity-80"
                      onClick={() => setShowThemeDropdown((v) => !v)}
                    >
                      <span
                        className={cn(
                          "text-base font-light",
                          theme ? "text-blue-600" : "text-gray-500"
                        )}
                      >
                        {theme || "Escolha o tema"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 transition-transform",
                          showThemeDropdown && "rotate-180",
                          theme ? "text-blue-600" : "text-gray-500"
                        )}
                      />
                    </button>

                    <div className="w-px h-8 bg-gray-300" />
                  </div>

                  {/* input sempre ocupa o restante */}
                  <div className="relative flex-1">
                    <AutoResizeTextarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      maxChars={MAX_CONTEXT}
                      placeholder="Descreva o contexto ou desafio..."
                      className="w-full bg-transparent outline-none text-base font-light placeholder:font-light text-gray-900 placeholder:text-gray-400 pr-9"
                    />
                    {/* contador dentro do input só no desktop */}
                    <span className="pointer-events-none hidden sm:inline absolute right-2 top-1/2 -translate-y-1/2 text-[10px] leading-none text-gray-400">
                      {context.length}/{MAX_CONTEXT}
                    </span>
                  </div>
                </div>

                {/* Dropdown */}
                {showThemeDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg border overflow-hidden z-50 bg-white border-gray-300">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {themeOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setTheme(opt); setShowThemeDropdown(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2 rounded-lg transition-all text-sm font-light",
                            theme === opt ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                <button
                  onClick={() => generateIdea()}
                  disabled={!theme.trim() || !context.trim() || isLoading}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Gerando..." : "Gerar Ideia"}
                </button>
                <button
                  onClick={surpriseMe}
                  disabled={isLoading}
                  className="px-8 py-3.5 rounded-lg border font-light text-base transition-all flex items-center gap-2 border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500"
                >
                  <Shuffle className="w-5 h-5" />
                  Surpreenda-me
                </button>
              </div>
            </div>
          </SectionContainer>

          {/* Result */}
          <div className="animate-fadeInUp animation-delay-400">
            <h2 className="text-2xl font-light mb-6">Resultado</h2>

            {currentIdea ? (
              <IdeaResultCard
                idea={currentIdea}
                onToggleFavorite={(id) => toggleFavorite(id)}
                onCopy={() => {}}
                onShare={() => {}}
              />            
            ) : (
              <SectionContainer className="rounded-2xl p-12 text-center animate-fadeIn border bg-white border-gray-200" >
                <p className="text-lg font-light text-gray-600">Digite um tema e contexto para gerar sua primeira ideia criativa</p>
              </SectionContainer>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <StatsCardWithIcon
              title="Ideias geradas"
              value={ideas.length}
              Icon={Lightbulb}
              className="animation-delay-0"
            />
            <StatsCardWithIcon
              title="Tempo médio"
              value={
                <span>
                  {averageResponseTime} <span className="text-lg font-light text-gray-500">ms</span>
                </span>
              }
              Icon={Clock}
              delay={100}
            />
            <StatsCardWithIcon
              title="Favoritas"
              value={favoriteIdeas.length}
              Icon={Star}
              delay={200}
            />
          </div>
        </div>
      </main>
      {disableChatWidget ? null : <ChatWidget />}

      <AppFooter />
    </div>
  );
};





