import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from "@/pages/LandingPage/LandingPage";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "@/pages/Register/Register";
import { GeneratorPage } from '@/pages/GeneratorPage/GeneratorPage';
import HistoryPage from '@/pages/History/History';
import FavoritesPage from '@/pages/FavoritesPage/FavoritesPage';
import DashboardPage from '@/pages/DashboardPage/DashboardPage';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PrivateLayout } from '@/layouts/PrivateLayout';
import { UserChatMetricsPage } from '@/pages/ChatMetricsPage/UserChatMetricPage';
import { AdminChatMetricsPage } from '@/pages/ChatMetricsPage/AdminChatMetricsPage';


const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />                
                </Route>

                {/* Private Routes */}
                <Route element={<PrivateLayout />}>
                    <Route path="/generator" element={<GeneratorPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/chatmetrics" element={<UserChatMetricsPage />} />
                    <Route path="/adminchatmetrics" element={<AdminChatMetricsPage />} />
                </Route>

            </Routes>

        </Router>
    )
}

export default AppRoutes; 