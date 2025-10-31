import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Hero: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!email.trim()) {
      setError("Por favor, digite um e-mail.");
      return;
    }

    // ✅ Validação simples de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    // 🔄 Limpa o erro e redireciona
    setError("");
    navigate(`/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-[#F9F9FB] text-[#1E1E1E] px-8 pt-24">
      {/* === TÍTULO === */}
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        Transforme palavras em{" "}
        <span className="text-gray-700 font-bold">ideias brilhantes</span>
      </h1>

      {/* === DESCRIÇÃO === */}
      <p className="text-lg text-gray-500 font-normal leading-relaxed max-w-2xl mb-12">
        Gere nomes de startups, slogans, produtos e posts usando IA. <br />
        Crie em minutos e experimente por si mesmo.
      </p>

      {/* === INPUT + BOTÃO === */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="relative w-full sm:max-w-2xl bg-white rounded-full border border-gray-200 shadow-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            className="w-full pl-8 pr-40 py-4 bg-transparent text-gray-800 text-base outline-none rounded-full placeholder:text-gray-400 caret-gray-700"
          />
          <button
            onClick={handleStart}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#335CFF] hover:bg-blue-700 text-white px-8 py-3 h-auto text-base font-semibold rounded-full shadow transition-all duration-200"
          >
            Começar Agora
          </button>
        </div>

        {/* 🔴 Mensagem de erro */}
        {error && (
          <p className="text-red-500 text-sm font-medium mt-3">{error}</p>
        )}
      </div>

      {/* === MOCKUP ILUSTRATIVO === */}
      <div className="relative mt-24 w-full max-w-6xl">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          <div className="flex h-[480px]">
            {/* Sidebar */}
            <div className="w-52 bg-white border-r border-gray-200 p-6">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                  IDEAFLOW
                </div>
                <div className="space-y-4">
                  {["Home", "Tasks", "Transactions", "Payments"].map(
                    (item, idx) => (
                      <div
                        key={item}
                        className={`text-sm font-light cursor-pointer transition-colors ${
                          idx === 0
                            ? "text-gray-900 font-medium"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 bg-[#F9FAFB] p-10">
              <div className="mb-6 flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search or jump to"
                  className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">Welcome, Jane</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                {["Send", "Request", "Transfer"].map((btn) => (
                  <button
                    key={btn}
                    className="px-4 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs text-gray-500 font-light mb-1">
                    Balance
                  </p>
                  <p className="text-2xl font-light text-gray-800">
                    $12,582,210
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 font-light">
                  <p>+2.2M</p>
                  <p>-1.4M</p>
                </div>
              </div>

              <div className="h-20 bg-white border border-gray-200 rounded-lg shadow-sm"></div>
            </div>
          </div>

          {/* Rodapé preto */}
          <div className="bg-black text-white text-center px-6 py-3 text-xs font-light">
            IdeaFlow é uma empresa de tecnologia criativa, não um banco.
          </div>
        </div>
      </div>
    </section>
  );
};
