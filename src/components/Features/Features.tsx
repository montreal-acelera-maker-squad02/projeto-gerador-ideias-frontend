import React from "react";

export const Features: React.FC = () => {
  const features = [
    {
      title: "Geração Automática",
      desc: "Use IA para criar ideias únicas em segundos.",
    },
    {
      title: "Design Simples",
      desc: "Interface intuitiva e moderna para qualquer usuário.",
    },
    {
      title: "Resultados Instantâneos",
      desc: "Sem esperas. Obtenha insights rápidos e criativos.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900">Recursos Principais</h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-light p-8 rounded-2xl shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
              <p className="text-gray-600 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
