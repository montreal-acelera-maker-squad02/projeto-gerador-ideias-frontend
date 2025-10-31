// pages/DashboardPage/DashboardPage.tsx
import { useMemo } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import StatsKPI from "@/components/StatsCard/StatsKPI";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";

export type Idea = {
  id: string;
  theme: string;
  context: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  responseTime?: number;
};

export type DashboardPageProps = {
  ideas: Idea[];
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ ideas }) => {
  const favoriteIdeas = useMemo(
    () => ideas.filter((i) => i.isFavorite),
    [ideas]
  );

  const averageResponseTime = useMemo(() => {
    const times = ideas.map((i) => i.responseTime ?? 0).filter((n) => n > 0);
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }, [ideas]);

  const byTheme = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of ideas) m.set(i.theme, (m.get(i.theme) ?? 0) + 1);
    return Array.from(m.entries()).map(([tema, quantidade]) => ({
      tema,
      quantidade,
    }));
  }, [ideas]);

  const palette = ["#a855f7", "#818cf8", "#3b82f6", "#8b5cf6", "#6366f1"];

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <div className="fixed top-0 left-0 right-0 h-72 pointer-events-none z-0 bg-gradient-to-b from-blue-100/40 via-purple-100/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-light mb-8 text-gray-900">Dashboard</h2>

        {/* Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsKPI
            title="Total de Ideias"
            value={ideas.length}
            className={cn(
              "animate-fadeInUp hover-lift border bg-white border-gray-200 rounded-2xl"
            )}
          />
          <StatsKPI
            title="Favoritos"
            value={favoriteIdeas.length}
            className={cn(
              "animate-fadeInUp animation-delay-100 hover-lift border bg-white border-gray-200 rounded-2xl"
            )}
          />
          <StatsKPI
            title="Tempo Médio"
            value={
              <span>
                {averageResponseTime}
                <span className="text-sm text-gray-500 ml-1">ms</span>
              </span>
            }
            className={cn(
              "animate-fadeInUp animation-delay-200 hover-lift border bg-white border-gray-200 rounded-2xl"
            )}
          />
        </div>

        {/* Ideas by Theme */}
        {ideas.length > 0 ? (
          <SectionContainer className="bg-white border border-gray-200 rounded-2xl p-8 mt-8 animate-fadeInUp animation-delay-300">
            <p className="text-lg font-light mb-6 text-gray-700">Ideias por Tema</p>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byTheme}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tema" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                    {byTheme.map(({ tema }, i) => (
                      <Cell key={tema} fill={palette[i % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionContainer>
        ) : null}
      </div>
    </div>
  );
};
