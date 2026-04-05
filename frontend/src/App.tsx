import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import SportsListPage from './pages/sports/SportsListPage';
import SportDetailPage from './pages/sports/SportDetailPage';
import SportNewPage from './pages/sports/SportNewPage';
import EquipesListPage from './pages/equipes/EquipesListPage';
import EquipeDetailPage from './pages/equipes/EquipeDetailPage';
import EquipeNewPage from './pages/equipes/EquipeNewPage';
import EvenementsListPage from './pages/evenements/EvenementsListPage';
import EvenementDetailPage from './pages/evenements/EvenementDetailPage';
import EvenementNewPage from './pages/evenements/EvenementNewPage';
import MatchsListPage from './pages/matchs/MatchsListPage';
import MatchDetailPage from './pages/matchs/MatchDetailPage';
import MatchNewPage from './pages/matchs/MatchNewPage';
import CalendarPage from './pages/CalendarPage';
import ProfilPage from './pages/ProfilPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sports" element={<SportsListPage />} />
              <Route path="/sports/new" element={<SportNewPage />} />
              <Route path="/sports/:id" element={<SportDetailPage />} />
              <Route path="/equipes" element={<EquipesListPage />} />
              <Route path="/equipes/new" element={<EquipeNewPage />} />
              <Route path="/equipes/:id" element={<EquipeDetailPage />} />
              <Route path="/evenements" element={<EvenementsListPage />} />
              <Route path="/evenements/new" element={<EvenementNewPage />} />
              <Route path="/evenements/:id" element={<EvenementDetailPage />} />
              <Route path="/matchs" element={<MatchsListPage />} />
              <Route path="/matchs/new" element={<MatchNewPage />} />
              <Route path="/matchs/:id" element={<MatchDetailPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/profil" element={<ProfilPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
