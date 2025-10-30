import { memo, type ReactNode } from "react";
import BaseStatsCard from "./BaseStatsCard";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatsCardWithIconProps = {
  title: string;
  value: ReactNode;
  Icon: LucideIcon;
  delay?: 0 | 100 | 200 | 300 | 400;
  className?: string;
  elevated?: boolean;
  iconBgClassName?: string;   // default: bg-blue-50
  iconClassName?: string;     // default: text-blue-600
  titleClassName?: string;    // default: text-sm font-light text-gray-600
  valueClassName?: string;    // default: text-4xl font-light text-gray-900
};

export default memo(function StatsCardWithIcon({
  title,
  value,
  Icon,
  delay = 0,
  className,
  elevated = true,
  iconBgClassName,
  iconClassName,
  titleClassName,
  valueClassName,
}: StatsCardWithIconProps) {
  const header = (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50",
          iconBgClassName
        )}
      >
        <Icon
          className={cn("w-5 h-5 text-blue-600", iconClassName)}
          aria-hidden="true"
        />
      </div>
      <h3 className={cn("text-sm font-light text-gray-600", titleClassName)}>
        {title}
      </h3>
    </div>
  );

  return (
    <BaseStatsCard
      header={header}
      value={
        <p className={cn("text-4xl font-light text-gray-900", valueClassName)}>
          {value}
        </p>
      }
      delay={delay}
      elevated={elevated}
      className={cn("border-gray-200", className)}
    />
  );
});
