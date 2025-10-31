import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  hideActions?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ hideActions = false }) => {
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 w-full backdrop-blur-md bg-[#F9F9FB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-5">
        
        {/* === LOGO + TEXTO (agora com acessibilidade) === */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded transition"
          aria-label="Voltar para a página inicial"
        >
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <span className="text-base font-semibold tracking-widest text-gray-800">
            IDEAFLOW
          </span>
        </button>

        {/* === MENU DE AÇÕES === */}
        {!hideActions && (
          <div className="flex items-center gap-8">
            <Link
              to="/login"
              className="text-gray-800 font-medium text-[15px] hover:text-blue-600 transition"
            >
              Log In
            </Link>

            <button
              onClick={() => navigate("/register")}
              className="bg-[#335CFF] text-white text-[15px] font-semibold px-7 py-2.5 rounded-full hover:bg-blue-700 transition"
            >
              Começar Agora
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
