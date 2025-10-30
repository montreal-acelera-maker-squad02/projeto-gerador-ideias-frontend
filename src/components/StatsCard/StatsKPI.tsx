import { memo, type ReactNode } from "react";
import BaseStatsCard from "./BaseStatsCard";
import { cn } from "@/lib/utils";

export type StatsKPIProps = {
  title: string;
  value: ReactNode;
  delay?: 0 | 100 | 200 | 300 | 400;
  className?: string;
  elevated?: boolean;

  labelClassName?: string; // default: text-sm font-light mb-3 text-gray-600
  valueClassName?: string; // default: text-5xl font-light text-gray-900
};

export default memo(function StatsKPI({
  title,
  value,
  delay = 0,
  className,
  elevated = false,
  labelClassName,
  valueClassName,
}: StatsKPIProps) {
  const header = (
    <p className={cn("text-sm font-light mb-3 text-gray-600", labelClassName)}>
      {title}
    </p>
  );

  return (
    <BaseStatsCard
      header={header}
      value={
        <p className={cn("text-5xl font-light text-gray-900", valueClassName)}>
          {value}
        </p>
      }
      delay={delay}
      elevated={elevated}
      className={cn("border-gray-200", className)}
    />
  );
});
