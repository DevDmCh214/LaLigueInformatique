import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function EquipesListPage() {
  const { isAdmin, subscribedSportIds } = useAuth();
  const [equipes, setEquipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/equipes').then(setEquipes).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  const sportIds = new Set(subscribedSportIds);
  const filtered = equipes.filter((eq) => sportIds.has(eq.sportId));

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Equipes</h1>
        {isAdmin && (
          <Link to="/equipes/new" className="btn-primary text-xs">+ Nouvelle equipe</Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Aucune equipe pour vos sports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eq) => (
            <Link key={eq.id} to={`/equipes/${eq.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-700">{eq.nom}</h3>
                <span className="badge-blue">{eq.sport.nom}</span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{eq._count.membres}/{eq.nombrePlaces} membres</span>
                <span>{eq._count.participations} match(s)</span>
              </div>
              {eq._count.membres >= eq.nombrePlaces && (
                <span className="badge-red mt-2">Complet</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
