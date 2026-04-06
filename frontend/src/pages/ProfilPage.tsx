import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfilPage() {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [allSports, setAllSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = () => {
    Promise.all([
      api.get<any>('/auth/me'),
      api.get<any[]>('/sports'),
    ]).then(([profileData, sportsData]) => {
      setProfile(profileData);
      setAllSports(sportsData);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!profile) return null;

  const mesSportsIds = new Set(profile.sportsInscrits.map((s: any) => s.sportId));

  async function toggleSport(sportId: number, isInscrit: boolean) {
    setActionLoading(sportId);
    await api[isInscrit ? 'del' : 'post']('/inscriptions', { sportId });
    // Refetch both profile and sports to update all state
    const [updatedProfile, updatedSports] = await Promise.all([
      api.get<any>('/auth/me'),
      api.get<any[]>('/sports'),
    ]);
    setProfile(updatedProfile);
    setAllSports(updatedSports);
    // Keep AuthContext in sync so subscribedSportIds updates across the app
    await refreshProfile();
    setActionLoading(null);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Mon profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">Informations</div>
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-400">Nom :</span> {profile.prenom} {profile.nom}</p>
            <p><span className="text-gray-400">Email :</span> {profile.email}</p>
            <p><span className="text-gray-400">Role :</span> <span className="badge-blue">{profile.role}</span></p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Mes equipes ({profile.appartenances.length})</div>
          {profile.appartenances.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune equipe.</p>
          ) : (
            <div className="space-y-2">
              {profile.appartenances.map((a: any) => (
                <Link
                  key={a.id}
                  to={`/equipes/${a.equipe.id}`}
                  className="block p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700 text-sm">{a.equipe.nom}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="card-header">Mes sports (listeSportsInscript)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allSports.map((sport) => {
              const isInscrit = mesSportsIds.has(sport.id);
              return (
                <button
                  key={sport.id}
                  onClick={() => toggleSport(sport.id, isInscrit)}
                  disabled={actionLoading === sport.id}
                  className={`p-3 rounded border text-sm font-medium transition-all ${
                    isInscrit
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {sport.nom}
                  {isInscrit && <span className="block text-xs mt-1">Inscrit</span>}
                  {!isInscrit && <span className="block text-xs mt-1 text-gray-400">Cliquer pour s'inscrire</span>}
                </button>
              );
            })}
            {allSports.length === 0 && (
              <p className="text-gray-400 text-sm col-span-full">Aucun sport disponible.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
