import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HistoryPage from "@/pages/History/History";
import { LandingPage } from "@/pages/LandingPage/LandingPage";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "./pages/Register/Register";
import { GeneratorPage } from "./pages/GeneratorPage/GeneratorPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
         <Route path="/register" element={<RegisterPage />} />
         <Route path="/generator" element={<GeneratorPage />} />
         <Route path="/dashboard" element={<DashboardPage />} />


      </Routes>
    </Router>
  );
}
