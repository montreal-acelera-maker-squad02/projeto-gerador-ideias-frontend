import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = Readonly<{ to: string; label: string; exact?: boolean }>;

export type UserMenuProps = Readonly<{
  userName?: string;
  onLogout?: () => void;
  nav?: NavItem[];
  includeMobileNav?: boolean; // show nav list inside dropdown on small screens
  className?: string;
}>;

export const UserMenu: React.FC<UserMenuProps> = ({
  userName = "Usuário",
  onLogout,
  nav = [],
  includeMobileNav = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // initial theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  // close on outside click / escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    document.documentElement.classList.toggle("dark", next);
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
    else navigate("/login");
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all-smooth hover:scale-105",
          "bg-blue-50 hover:bg-blue-100 border border-blue-200/50"
        )}
      >
        <span className="text-sm font-light">{userName}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-64 rounded-xl border bg-white shadow-lg z-[9999]",
            "border-gray-200 animate-slideDown"
          )}
        >
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              "w-full text-left px-4 py-3 text-sm flex items-center gap-3",
              "hover:bg-gray-100 transition-all-smooth"
            )}
            role="menuitem"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-yellow-500" />
                <span>Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span>Modo escuro</span>
              </>
            )}
          </button>

          <div className="my-1 h-px bg-gray-200" />

          {/* Mobile nav inside dropdown */}
          {includeMobileNav && nav.length > 0 && (
            <div className="block md:hidden">
              <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500">
                Navegação
              </div>
              <ul className="py-1">
                {nav.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.exact}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "block px-4 py-2 text-sm transition-all-smooth",
                          "hover:bg-gray-100",
                          isActive ? "text-blue-600" : "text-gray-700"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="my-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-red-600",
              "hover:bg-red-50 transition-all-smooth"
            )}
            role="menuitem"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
