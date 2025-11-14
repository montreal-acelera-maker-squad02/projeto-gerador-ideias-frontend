import { Heart } from "lucide-react";
import BaseIdeaCard, {
  type BaseIdeaCardProps,
  type Idea,
} from "./BaseIdeiaCard";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export type CommunityIdea = Idea & {
  author: string;
  tokens?: number;
};

type CommunityIdeaCardProps = Readonly<
  Omit<
    BaseIdeaCardProps,
    | "idea"
    | "density"
    | "actions"
    | "metaMode"
    | "showDivider"
    | "headerRight"
    | "footerRight"
    | "onToggleFavorite"
  > & {
    idea: CommunityIdea;
    /** Callback específico da lista da comunidade */
    onToggleFavorite?: (id: string) => void;
    /** Permite ajustar o clamp se quiser; padrão 3 linhas */
    clampLines?: number | null;
  }
>;

export default function CommunityIdeaCard({
  idea,
  onToggleFavorite,
  clampLines = 3,
  className,
  ...rest
}: CommunityIdeaCardProps) {
  const { darkMode } = useTheme();

  const surface = darkMode
    ? "bg-slate-900/60 border border-slate-700 hover:border-slate-500"
    : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg";

  const createdAtLabel = new Date(idea.timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const headerRight = (
    <button
      aria-label={idea.isFavorite ? "Desfavoritar" : "Favoritar"}
      className="opacity-100 transition-all-smooth p-1 hover:scale-110 cursor-pointer"
      title={idea.isFavorite ? "Remover dos favoritos" : "Favoritar"}
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite?.(idea.id);
      }}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all",
          idea.isFavorite
            ? "fill-red-500 text-red-500"
            : darkMode
              ? "text-slate-300 hover:text-red-400"
              : "text-gray-400 hover:text-red-500"
        )}
      />
    </button>
  );

  const footerLeft = (
    <div className="flex flex-col gap-0.5 text-xs font-light">
      <div className={cn(darkMode ? "text-slate-400" : "text-gray-500")}>
        Por:{" "}
        <span
          className={cn(
            "font-medium",
            darkMode ? "text-slate-100" : "text-gray-700"
          )}
        >
          {idea.author}
        </span>
      </div>
      <div className={cn(darkMode ? "text-slate-400" : "text-gray-500")}>
        {createdAtLabel}
      </div>
    </div>
  );

  const footerRight = (
    <div className="text-right space-y-0.5 text-xs font-light">
      {typeof idea.responseTime === "number" && (
        <div className={cn(darkMode ? "text-slate-400" : "text-gray-500")}>
          Tempo:{" "}
          <span
            className={cn(
              "font-medium",
              darkMode ? "text-slate-100" : "text-gray-700"
            )}
          >
            {idea.responseTime}ms
          </span>
        </div>
      )}
      {typeof idea.tokens === "number" && (
        <div className={cn(darkMode ? "text-slate-400" : "text-gray-500")}>
          Tokens:{" "}
          <span
            className={cn(
              "font-medium",
              darkMode ? "text-slate-100" : "text-gray-700"
            )}
          >
            {idea.tokens}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <BaseIdeaCard
      idea={idea}
      density="compact"
      clampLines={clampLines}
      actions="none"
      metaMode="none"
      showDivider
      headerRight={headerRight}
      footerRight={footerRight}
      footerLeft={footerLeft}
      className={cn("transition-all-smooth cursor-pointer", surface, className)}
      {...rest}
    />
  );
}
