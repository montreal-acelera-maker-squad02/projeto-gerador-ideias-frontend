import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-background text-foreground px-8 pt-28">
      {/* === TÍTULO === */}
      <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
        Transforme palavras em{" "}
        <span className="text-gray-400 font-semibold">ideias brilhantes</span>
      </h1>

      {/* === DESCRIÇÃO === */}
      <div className="text-lg text-gray-500 font-light mb-12 leading-relaxed max-w-2xl">
        <p>Gere nomes de startups, slogans, produtos e posts usando IA.</p>
        <p>Crie em minutos e experimente por si mesmo.</p>
      </div>

      {/* === INPUT + BOTÃO === */}
      <div className="flex items-center justify-center w-full">
        <div className="relative w-full sm:max-w-2xl bg-[#F9FAFB] rounded-full border border-gray-200 shadow-sm">
          <input
            type="email"
            placeholder="Digite seu email"
            className="w-full pl-8 pr-40 py-4 bg-transparent text-black text-base outline-none rounded-full placeholder:text-gray-500 caret-black"
          />
          <button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#335CFF] hover:bg-blue-700 text-white px-8 py-3 h-auto text-base font-semibold rounded-full shadow transition-all duration-200">
            Começar Agora
          </button>
        </div>
      </div>

      {/* === MOCKUP ILUSTRATIVO AJUSTADO === */}
      <div className="relative mt-20 w-full max-w-6xl">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          {/* CONTEÚDO DO CARD */}
          <div className="flex h-[480px]">
            {/* SIDEBAR */}
            <div className="w-52 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                  IDEAFlow
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

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 bg-[#F9FAFB] p-10">
              <div className="mb-6 flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search or jump to"
                  className="w-1/2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">Welcome, Jane</p>
              </div>

              {/* BOTÕES */}
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

              {/* BALANCE INFO */}
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

              {/* BOX DE EXEMPLO */}
              <div className="h-20 bg-white border border-gray-200 rounded-lg shadow-sm"></div>
            </div>
          </div>

          {/* AVISO INFERIOR */}
          <div className="bg-black text-white text-center px-6 py-3 text-xs font-light">
            IdeaFlow é uma empresa de tecnologia criativa, não um banco.
          </div>
        </div>
      </div>
    </section>
  );
};
