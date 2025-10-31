import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage/LandingPage";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "./pages/Register/Register";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
         <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}
