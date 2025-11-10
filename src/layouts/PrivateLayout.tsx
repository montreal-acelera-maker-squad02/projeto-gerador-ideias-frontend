// src/layouts/PrivateLayout.tsx
import { Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { AppHeader } from "@/components/Header/AppHeader";
import { AppFooter } from "@/components/Footer/AppFooter";

export function PrivateLayout() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 dark:text-slate-100">

        {/* Decorative Gradient */}
        <div className="fixed top-0 left-0 right-0 h-72 pointer-events-none z-0 bg-gradient-to-b from-blue-100/40 via-purple-100/30 to-transparent" />

        <AppHeader />

        {/* conteúdo da página */}
        <main className="flex-1">
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
