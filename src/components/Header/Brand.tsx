import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export type BrandProps = Readonly<{
  className?: string;
  onClick?: () => void;
}>;

export const Brand: React.FC<BrandProps> = ({ className, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Ir para a página inicial"
      className={cn(
        "flex items-center gap-3 cursor-pointer bg-transparent border-0 outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900 shadow-md">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <span className="text-base font-semibold tracking-widest text-gray-800">
        IDEAFLOW
      </span>
    </button>
  );
};

export default Brand;
