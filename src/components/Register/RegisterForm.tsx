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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      console.log(" Usuário registrado com sucesso:", data);
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error.response);

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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-12.5 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5
                       c4.478 0 8.268 2.943 9.542 7
                       -1.274 4.057-5.064 7-9.542 7
                       -4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19
                       c-4.478 0-8.268-2.943-9.542-7
                       a9.957 9.957 0 013.574-4.568M9.88 9.88
                       A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"
                  />
                </svg>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              A senha deve conter pelo menos 8 caracteres, incluindo letra
              maiúscula, minúscula, número e caractere especial.
            </p>
          </div>

          {/* Confirmar senha */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-12.5 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5
                       c4.478 0 8.268 2.943 9.542 7
                       -1.274 4.057-5.064 7-9.542 7
                       -4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19
                       c-4.478 0-8.268-2.943-9.542-7
                       a9.957 9.957 0 013.574-4.568M9.88 9.88
                       A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-md font-semibold text-white bg-linear-to-r from-[#9C6FFF] to-[#335CFF]
                       shadow-[0_4px_12px_rgba(51,92,255,0.3)] hover:shadow-[0_8px_20px_rgba(51,92,255,0.45)]
                       transition-all duration-300 disabled:opacity-60"
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
