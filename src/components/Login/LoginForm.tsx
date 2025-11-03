import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      console.log("✅ Login bem-sucedido:", data);

      // Salva token e usuário localmente
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redireciona após login
      navigate("/dashboard");
    } catch (error: any) {
      console.error("❌ Erro ao logar:", error.response?.data || error.message);
      alert("Falha ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-[#eef3ff] border border-transparent rounded-lg text-gray-700 focus:ring-2 focus:ring-[#335CFF] focus:bg-white focus:border-[#335CFF] outline-none transition-all"
        />
      </div>

      {/* Campo de Senha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-[#eef3ff] border border-transparent rounded-lg text-gray-700 focus:ring-2 focus:ring-[#335CFF] focus:bg-white focus:border-[#335CFF] outline-none transition-all"
        />
      </div>

      {/* Botão */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white bg-linear-to-r from-[#9C6FFF] to-[#335CFF] shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Fazer Login"}
      </button>
    </form>
  );
};