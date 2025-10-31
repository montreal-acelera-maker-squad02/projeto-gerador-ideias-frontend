import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailFromURL = queryParams.get("email") || "";

  const [form, setForm] = useState({
    name: "",
    email: emailFromURL, // 👈 já preenche
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  // Garante atualização se a URL mudar
  useEffect(() => {
    if (emailFromURL) {
      setForm((prev) => ({ ...prev, email: emailFromURL }));
    }
  }, [emailFromURL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError("");
    console.log("✅ Cadastro enviado:", form);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center py-28 px-6">
      <div className="w-full max-w-lg">
        {/* Título */}
        <h2 className="text-[2rem] font-semibold text-center text-gray-900 mb-2">
          Crie sua conta
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Comece a gerar ideias criativas agora mesmo
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          </div>

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

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-1.5 mt-2 rounded-md font-semibold text-white bg-linear-to-r from-[#9C6FFF] to-[#335CFF] shadow-[0_4px_12px_rgba(51,92,255,0.3)] transform transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(51,92,255,0.45)]"
          >
            Criar Conta
          </button>
        </form>

        {/* Links abaixo */}
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
              <div className="w-full border-t border-gray-200 my-4"></div>
            ← Voltar à página inicial
          </button>
        </div>
      </div>
    </section>
  );
};
