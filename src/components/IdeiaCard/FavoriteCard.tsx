import { useEffect, useRef, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import BaseIdeiaCard, { type BaseIdeaCardProps } from "./BaseIdeiaCard";

interface FavoriteCardProps
  extends Omit<
    BaseIdeaCardProps,
    | "density"
    | "clampLines"
    | "actions"
    | "metaMode"
    | "showDivider"
    | "headerRight"
  > {
  onToggleFavorite?: (id: string) => Promise<void> | void;
}

export default function FavoriteCard({
  idea,
  onToggleFavorite,
  ...props
}: Readonly<FavoriteCardProps>) {
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    const result = onToggleFavorite?.(idea.id);

    if (result && typeof result === "object" && "finally" in result) {
      result.finally(() => {
        if (isMounted.current) setLoading(false);
      });
    } else if (isMounted.current) {
      setLoading(false);
    }
  };

  const headerRight = (
    <button
      aria-label="Desfavoritar"
      className="opacity-100 transition-all-smooth p-1 hover:scale-110 cursor-pointer"
      title="Remover dos favoritos"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
      )}
    </button>
  );

  return (
    <BaseIdeiaCard
      density="compact"
      clampLines={2}
      actions="none"
      metaMode="minimal"
      showDivider={false}
      headerRight={headerRight}
      className="bg-linear-to-r from-pink-50 to-red-50/40 border border-red-200 hover:border-red-300 transition-all-smooth"
      idea={idea}
      {...props}
    />
  );
}
