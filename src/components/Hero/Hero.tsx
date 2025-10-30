import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-light px-6 pt-24">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
        Transforme palavras em <span className="text-primary">ideias brilhantes</span>
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-2xl">
        Gere nomes de startups, slogans e posts usando IA. <br />
        Crie em minutos e experimente por si mesmo.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="Digite seu email"
          className="border border-gray-300 px-4 py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:ring-2 focus:ring-primary outline-none w-72"
        />
        <button className="bg-primary text-white px-6 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-blue-600 transition">
          Começar Agora
        </button>
      </div>
    </section>
  );
};
