import { memo, type ReactNode } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import {
  Heart,
  Copy,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import './style.css';

export type Idea = {
  id: string;
  theme: string;
  context: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  responseTime?: number;
};

export type Density = "comfortable" | "compact";
export type ActionsKind = "full" | "minimal" | "none";
export type MetaMode = "full" | "minimal" | "none";

export type BaseIdeaCardProps = {
  idea: Idea;
  density?: Density;
  clampLines?: number | null;
  showThemePill?: boolean;
  showContextPill?: boolean;
  metaMode?: MetaMode;
  showDivider?: boolean;
  actions?: ActionsKind;
  headerRight?: ReactNode;
  footerRight?: ReactNode;
  onToggleFavorite?: (id: string) => void;
  onCopy?: (text: string) => void;
  onShare?: (text: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
  className?: string;
};

function formatDateBR(d: Date) {
  const date = new Date(d);
  return (
    date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " às " +
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

function formatDateOnlyBR(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

type PillKind = "theme" | "context";
type PillProps = { children: ReactNode; kind?: PillKind };

function Pill({ children, kind = "theme"}: Readonly<PillProps>) {
  const cls =
    kind === "theme"
      ? "inline-block px-4 py-2 rounded-full text-sm font-light animate-fadeInUp bg-blue-100 text-blue-700"
      : "inline-block px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700";
  return <span className={cn(cls)} title={(children as string) || ""}>{children}</span>;
}

function FullActions({
  isFavorite,
  onFav,
  onCopy,
  onShare,
}: Readonly<{
  isFavorite?: boolean;
  onFav?: () => void;
  onCopy?: () => void | Promise<void>;
  onShare?: () => void | Promise<void>;
}>) {
  const btn = "p-2 rounded-lg transition-all-smooth hover:scale-110 hover:bg-gray-100 cursor-pointer";
  return (
    <div className="flex items-center gap-2">
      <button aria-label="Copiar" title="Copiar" className={cn("p-2 rounded-lg transition-all hover:scale-110 hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer")} onClick={onCopy}>
        <Copy className="w-5 h-5" />
      </button>
      <button aria-label="Compartilhar" title="Compartilhar" className={cn("p-2 rounded-lg transition-all hover:scale-110 hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer")} onClick={onShare}>
        <Share2 className="w-5 h-5" />
      </button>
      <button
        aria-label="Favoritar"
        aria-pressed={!!isFavorite}
        className={btn}
        onClick={onFav}
        title={isFavorite ? "Desfavoritar" : "Favoritar"}
      >
        <Heart 
          className={cn(
            "w-5 h-5 transition-all",
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-500 hover:text-red-500"
          )}
        />
      </button>
    </div>
  );
}


export default memo(function BaseIdeaCard({
  idea,
  density = "comfortable",
  clampLines = null,
  showThemePill = true,
  showContextPill = true,
  metaMode = "full",
  showDivider = true,
  actions = "full",
  headerRight,
  footerRight,
  onToggleFavorite,
  onCopy,
  onShare,
  //onDelete,
  onClick,
  className = "",
}: BaseIdeaCardProps) {
  // helpers de estilo e flags
  const pad = density === "compact" ? "p-4" : "p-8";
  const textSize = density === "compact" ? "text-base" : "text-2xl";
  const clamp = clampLines ? ` line-clamp-${clampLines}` : "";
  const surface = "rounded-2xl border-2 bg-white border-gray-300 shadow-md ";
  const showMeta = metaMode === "full" || metaMode === "minimal";

  // meta node
  const metaNode = showMeta ? (
    <div className="flex flex-col gap-1">
      {metaMode === "full" ? (
        <>
          <div className="text-sm font-light text-gray-600">Gerado em {formatDateBR(idea.timestamp)}</div>
          {typeof idea.responseTime === "number" && (
            <div className="text-xs font-light text-gray-500">Tempo de resposta: {idea.responseTime}ms</div>
          )}
        </>
      ) : (
        <div className="text-xs font-light text-gray-500">{formatDateOnlyBR(idea.timestamp)}</div>
      )}
    </div>
  ) : (
    <div />
  );

  // actions node (direita do footer) — preserva lógica atual
  const actionsNode = footerRight
    ? <div className="shrink-0">{footerRight}</div>
    : actions !== "none" && actions === "full"
    ? (
        <FullActions
          isFavorite={idea.isFavorite}
          onFav={() => onToggleFavorite?.(idea.id)}
          onCopy={async () => {
            await navigator.clipboard.writeText(idea.content);
            onCopy?.(idea.content);
          }}
          onShare={async () => {
            if (navigator.share) {
              await navigator.share({ title: "Ideia Gerada", text: idea.content });
            } else {
              await navigator.clipboard.writeText(idea.content);
            }
            onShare?.(idea.content);
          }}
        />
      )
    : null;

  const shouldShowFooter = metaMode !== "none" || actions !== "none" || !!footerRight;

  return (
    <SectionContainer
      className={cn("idea-card-scope group cursor-pointer", surface, pad, "animate-scaleIn", className)}
      onClick={onClick}
    >
      {/* Header: pills */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {showThemePill && <Pill kind="theme">{idea.theme}</Pill>}
          {showContextPill && idea.context ? <Pill kind="context">{idea.context}</Pill> : null}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>

      {/* Body */}
      <p className={`${textSize} font-light leading-relaxed mb-6 ${clamp} text-gray-800`}>
        {idea.content}
      </p>

      {/* Footer */}
      {shouldShowFooter && (
        <div className={ cn("flex items-center justify-between", showDivider ? "pt-6 border-t border-gray-200" : "pt-2") }>
          {metaNode}
          {actionsNode}
        </div>
      )}
    </SectionContainer>
  );
});
