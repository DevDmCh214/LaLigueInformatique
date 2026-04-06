import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SportSelectionModal from './SportSelectionModal';

export default function ProtectedRoute() {
  const { isAuthenticated, hasSports, loading, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasSports) {
    return <SportSelectionModal onComplete={refreshProfile} />;
  }

  return <Outlet />;
}
