import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from "@/pages/LandingPage/LandingPage";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "@/pages/Register/Register";
import { GeneratorPage } from '@/pages/GeneratorPage/GeneratorPage';
import HistoryPage from '@/pages/History/History';
import FavoritesPage from '@/pages/FavoritesPage/FavoritesPage';
import DashboardPage from '@/pages/DashboardPage/DashboardPage';


const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Private Routes */}
                <Route path="/generator" element={<GeneratorPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

            </Routes>

        </Router>
    )
}

export default AppRoutes; 