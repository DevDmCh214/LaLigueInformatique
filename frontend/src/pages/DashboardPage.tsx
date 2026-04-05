import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!data) return null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mes equipes</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{data.equipes.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Evenements a venir</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{data.evenements.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mes reponses</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{data.reponseCount}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Sports inscrits</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{data.sportsInscrits}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-600">Mes equipes</h2>
          <Link to="/equipes/new" className="btn-primary text-xs">+ Nouvelle equipe</Link>
        </div>
        {data.equipes.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune equipe. Rejoignez ou creez une equipe !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.equipes.map((eq: any) => (
              <Link key={eq.id} to={`/equipes/${eq.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
                <h3 className="font-semibold text-gray-700">{eq.nom}</h3>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{eq._count.membres}/{eq.nombrePlaces} membres</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-600">Prochains evenements</h2>
          <Link to="/evenements/new" className="btn-primary text-xs">+ Nouvel evenement</Link>
        </div>
        {data.evenements.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun evenement a venir.</p>
        ) : (
          <div className="space-y-2">
            {data.evenements.map((ev: any) => (
              <Link
                key={ev.id}
                to={ev.match ? `/matchs/${ev.match.id}` : `/evenements/${ev.id}`}
                className="card flex justify-between items-center hover:shadow-md hover:border-gray-400 transition-all"
              >
                <div>
                  <h3 className="font-medium text-gray-700 text-sm">{ev.entitule}</h3>
                  <p className="text-xs text-gray-400">
                    {ev.sport.nom} — {new Date(ev.dateHeure).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={ev.match ? 'badge-blue' : 'badge-green'}>
                  {ev.match ? 'Match' : 'Evenement'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
