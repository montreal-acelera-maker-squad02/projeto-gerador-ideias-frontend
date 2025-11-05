import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { setAuthToken } from "@/lib/api";
import { TextField } from "@/components/common/TextField";
import { PasswordToggle } from "@/components/common/PasswordToggle";
import { useChatContext } from "@/context/ChatContext";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { preload } = useChatContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      if (data?.token) {
        setAuthToken(data.token);
        localStorage.setItem("token", data.token);
        void preload().catch((err) => console.warn("Falha ao pre-carregar o chat", err));
      }

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/history");
    } catch (error: any) {
      console.error("Erro ao logar:", error?.response?.data || error?.message);
      alert("Falha ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de email */}
      <TextField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
      />

      {/* Campo de senha */}
      <div className="relative">
        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
        />
        <PasswordToggle
          visible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          className="top-12"
        />
      </div>

      {/* Botão de login */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white 
                   bg-linear-to-r from-[#9C6FFF] to-[#335CFF]
                   shadow-md hover:shadow-lg transform transition-all 
                   hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Fazer Login"}
      </button>
    </form>
  );
};

