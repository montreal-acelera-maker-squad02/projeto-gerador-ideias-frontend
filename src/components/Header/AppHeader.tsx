import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from '@/lib/utils';
import Brand from './Brand';

export type NavItem = Readonly<{ to: string; label: string; exact?: boolean}>;

const DEFAULT_NAV: NavItem[] = [
  { to: "/generator", label: "Início" },
  { to: "/history",   label: "Histórico" },
  { to: "/favorites", label: "Favoritos" },
  { to: "/dashboard", label: "Dashboard" },
];

export type AppHeaderProps = Readonly<{
    nav?: NavItem[];
    className?: string;
    userName?: string;
    onLogout?: () => void;
}>;

export const AppHeader: React.FC<AppHeaderProps> = ({
    nav = DEFAULT_NAV,
    className,
}) => {
    return (
        <header
            className={cn(
                "sticky top-0 z-50 border-b backdrop-blur-md",
                "bg-white/90 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
                className
            )}
        >
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                {/* Brand */}
                <Brand />

                {/* Primary nav */}
                <nav className="hidden md:flex gap-8">
                    {nav.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "text-sm font-light transition-all-smooth relative px-1 py-1",
                                    isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                                )
                            }
                            end={item.exact}
                        >
                            {({ isActive }) => (
                                <span className="relative inline-block">
                                    {item.label}
                                    {isActive ? (
                                        <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-blue-600 animate-fadeIn" />
                                    ) : null}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Dropdown */}
                <div className="2-24" aria-hidden />
            </div>
        </header>
    );
}