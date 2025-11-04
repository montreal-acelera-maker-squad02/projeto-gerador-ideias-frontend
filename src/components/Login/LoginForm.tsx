import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { setAuthToken } from "@/lib/api";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      if (data?.token) {
        setAuthToken(data.token);
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      navigate("/history");
    } catch (error: any) {
      console.error("Erro ao logar:", (error as any)?.response?.data || (error as any)?.message);
      alert("Falha ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-[#eef3ff] border border-transparent rounded-lg text-gray-700 
                     focus:ring-2 focus:ring-[#335CFF] focus:bg-white focus:border-[#335CFF] 
                     outline-none transition-all"
        />
      </div>

      {/* Campo de senha */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-[#eef3ff] border border-transparent rounded-lg text-gray-700 
                     focus:ring-2 focus:ring-[#335CFF] focus:bg-white focus:border-[#335CFF] 
                     outline-none transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7
                   a9.957 9.957 0 013.574-4.568M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8" />
            </svg>
          )}
        </button>
      </div>

      {/* Botão de login */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white bg-linear-to-r from-[#9C6FFF] to-[#335CFF]
                   shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Fazer Login"}
      </button>
    </form>
  );
};
