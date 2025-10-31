import React, { useState } from "react";

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password });
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
                className="
    w-full py-1.5 rounded-lg font-semibold text-white 
    bg-linear-to-r from-[#9C6FFF] to-[#335CFF] 
    shadow-[0_4px_12px_rgba(51,92,255,0.3)]
    transform transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(51,92,255,0.45)]
    focus:-translate-y-0.5 focus:shadow-[0_8px_20px_rgba(51,92,255,0.45)]
  "
            >
                Fazer Login
            </button>
        </form>
    );
};
