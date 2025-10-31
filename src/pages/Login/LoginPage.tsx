import React from "react";
import { LoginHeader } from "@/components/Login/LoginHeader";
import { LoginForm } from "@/components/Login/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/10385/10385380.png"
            alt="IDEAFLOW"
            className="h-12"
          />
        </div>

        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
};
