import { Heart, Trash2 } from "lucide-react";
import BaseIdeaCard, { type BaseIdeaCardProps } from "./BaseIdeiaCard";

export default function IdeaHistoryCard(
  props: Readonly<Omit<
    BaseIdeaCardProps,
    | "density"
    | "clampLines"
    | "actions"
    | "metaMode"
    | "showDivider"
    | "headerRight"
    | "footerRight"
  >>
) {
  const listSurfaceLight =
    "bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 hover:border-blue-300 hover-lift transition-all-smooth";
  // const listSurfaceDark =
  //   "dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700/50 dark:border-slate-700";

  const headerRight = (
    <button
      aria-label="Favoritar"
      className="opacity-0 group-hover:opacity-100 transition-all-smooth p-1 hover:scale-110"
      title={props.idea.isFavorite ? "Desfavoritar" : "Favoritar"}
      onClick={(e) => {
        e.stopPropagation();
        props.onToggleFavorite?.(props.idea.id);
      }}
    >
      <Heart
        className={
          "w-4 h-4 transition-all " +
          (props.idea.isFavorite
            ? "fill-red-500 text-red-500"
            : "text-gray-500 hover:text-red-500")
        }
      />
    </button>
  );

  const footerRight = (
    <button
      aria-label="Excluir"
      className="opacity-0 group-hover:opacity-100 transition-all-smooth p-1 text-red-600 hover:bg-red-100/50 rounded hover:scale-110"
      title="Excluir"
      onClick={(e) => {
        e.stopPropagation();
        props.onDelete?.(props.idea.id);
      }}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  return (
    <BaseIdeaCard
      density="compact"
      clampLines={2}
      actions="none"
      metaMode="minimal"
      showDivider={false}
      headerRight={headerRight}
      footerRight={footerRight}
      className={`${listSurfaceLight}`}
      {...props}
    />
  );
}
