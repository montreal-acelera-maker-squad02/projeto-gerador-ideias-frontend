import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailFromURL = queryParams.get("email") || "";

  const [form, setForm] = useState({
    name: "",
    email: emailFromURL,
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromURL) {
      setForm((prev) => ({ ...prev, email: emailFromURL }));
    }
  }, [emailFromURL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStrongPassword(form.password)) {
      setError(
        "A senha deve ter no mínimo 8 caracteres e conter pelo menos: uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authService.register(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );

      console.log("✅ Usuário registrado com sucesso:", data);
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error(" Erro ao cadastrar:", error.response);

      if (error.response?.status === 409) {
        setError("Este e-mail já está em uso.");
      } else if (error.response?.status === 400) {
        const backendError =
          error.response.data?.message ||
          error.response.data?.errors?.[0] ||
          "Erro de validação nos dados.";
        setError(backendError);
      } else {
        setError("Falha ao realizar cadastro. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-center justify-center py-28 px-6">
      <div className="w-full max-w-lg">
        <h2 className="text-[2rem] font-semibold text-center text-gray-900 mb-2">
          Crie sua conta
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Comece a gerar ideias criativas agora mesmo
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Seu nome"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Seu email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A senha deve conter pelo menos 8 caracteres, incluindo letra
              maiúscula, minúscula, número e caractere especial.
            </p>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-md font-semibold text-white bg-linear-to-r from-[#9C6FFF] to-[#335CFF] shadow-[0_4px_12px_rgba(51,92,255,0.3)] hover:shadow-[0_8px_20px_rgba(51,92,255,0.45)] transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Criar Conta"}
          </button>
        </form>

        {/* Ações extras */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Já possui uma conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Faça login
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Voltar à página inicial
          </button>
        </div>
      </div>
    </section>
  );
};
