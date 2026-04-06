import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function SportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [sport, setSport] = useState<any>(null);
  const [isInscrit, setIsInscrit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    Promise.all([
      api.get<any>(`/sports/${id}`),
      api.get<any[]>('/inscriptions'),
    ]).then(([sportData, inscriptions]) => {
      setSport(sportData);
      setIsInscrit(inscriptions.some((i: any) => i.sportId === Number(id)));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  async function toggleInscription() {
    setActionLoading(true);
    await api[isInscrit ? 'del' : 'post']('/inscriptions', { sportId: Number(id) });
    fetchData();
    setActionLoading(false);
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce sport ? Tous les evenements associes seront perdus.')) return;
    setActionLoading(true);
    await api.del(`/sports/${id}`);
    navigate('/sports');
  }

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!sport) return <p className="text-gray-400">Sport non trouve.</p>;

  return (
    <div>
      <Link to="/sports" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux sports</Link>
      <div className="flex justify-between items-center mt-2 mb-5">
        <h1 className="text-xl font-semibold text-gray-700">{sport.nom}</h1>
        <div className="flex gap-2">
          <button onClick={toggleInscription} disabled={actionLoading} className={isInscrit ? 'btn-secondary' : 'btn-primary'}>
            {actionLoading ? '...' : isInscrit ? 'Se desinscrire' : "S'inscrire"}
          </button>
          {isAdmin && (
            <button onClick={handleDelete} disabled={actionLoading} className="btn-danger">
              Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">Inscrits ({sport.inscriptions.length})</div>
          {sport.inscriptions.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun inscrit.</p>
          ) : (
            <table>
              <thead><tr><th>Nom</th><th>Email</th></tr></thead>
              <tbody>
                {sport.inscriptions.map((ins: any) => (
                  <tr key={ins.id}>
                    <td>{ins.utilisateur.prenom} {ins.utilisateur.nom}</td>
                    <td>{ins.utilisateur.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">Evenements ({sport.evenements.length})</div>
          {sport.evenements.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun evenement pour ce sport.</p>
          ) : (
            <div className="space-y-2">
              {sport.evenements.map((ev: any) => (
                <Link
                  key={ev.id}
                  to={ev.match ? `/matchs/${ev.match.id}` : `/evenements/${ev.id}`}
                  className="block p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 text-sm">{ev.entitule}</span>
                    <span className={ev.match ? 'badge-blue' : 'badge-green'}>
                      {ev.match ? 'Match' : 'Evenement'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ev.dateHeure).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                    })}
                    {' — '}{ev.participants} participant(s)
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
