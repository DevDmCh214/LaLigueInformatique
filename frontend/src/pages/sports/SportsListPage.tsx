import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function SportsListPage() {
  const [sports, setSports] = useState<any[]>([]);
  const [inscritIds, setInscritIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/sports'),
      api.get<any[]>('/inscriptions'),
    ]).then(([sportsData, inscriptions]) => {
      setSports(sportsData);
      setInscritIds(new Set(inscriptions.map((i: any) => i.sportId)));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Sports</h1>
        <Link to="/sports/new" className="btn-primary text-xs">+ Nouveau sport</Link>
      </div>

      {sports.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-gray-400 mb-4">Aucun sport enregistre.</p>
          <Link to="/sports/new" className="btn-primary">Creer un sport</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((sport) => (
            <Link key={sport.id} to={`/sports/${sport.id}`} className="card hover:shadow-md hover:border-gray-400 transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-700">{sport.nom}</h3>
                {inscritIds.has(sport.id) && <span className="badge-green">Inscrit</span>}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{sport._count.inscriptions} inscrit(s)</span>
                <span>{sport._count.evenements} evenement(s)</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
