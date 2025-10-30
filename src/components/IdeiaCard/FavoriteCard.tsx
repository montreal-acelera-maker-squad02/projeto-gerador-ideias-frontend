import BaseIdeaCard, { type BaseIdeaCardProps } from "./BaseIdeiaCard";
import { Heart } from "lucide-react";

export default function FavoriteCard(
  props: Readonly<
    Omit<
      BaseIdeaCardProps,
      | "density"
      | "clampLines"
      | "actions"
      | "metaMode"
      | "showDivider"
      | "headerRight"
      | "footerRight"
    >
  >
) {
  const favSurfaceLight =
    "bg-gradient-to-r from-red-50 to-pink-50/30 border border-red-200/50 hover:border-red-300";
  // const favSurfaceDark =
  //   "dark:bg-gradient-to-r dark:from-red-900/20 dark:to-slate-800 dark:border-red-700/50";

  const headerRight = (
    <button
      aria-label="Desfavoritar"
      className="p-1"
      title="Desfavoritar"
      onClick={(e) => {
        e.stopPropagation();
        props.onToggleFavorite?.(props.idea.id);
      }}
    >
      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
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
      className={`${favSurfaceLight}`}
      {...props}
    />
  );
}
