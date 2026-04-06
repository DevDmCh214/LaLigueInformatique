import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const reponseOptions = [
  { value: 'present', label: 'Present', className: 'bg-green-500 hover:bg-green-600 text-white' },
  { value: 'peut-etre', label: 'Peut-etre', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { value: 'absent', label: 'Absent', className: 'bg-red-500 hover:bg-red-600 text-white' },
] as const;

export default function EvenementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [evenement, setEvenement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    api.get<any>(`/evenements/${id}`).then(setEvenement).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!evenement) return <p className="text-gray-400">Evenement non trouve.</p>;

  if (evenement.match) {
    return (
      <div className="card text-center py-10">
        <p className="text-gray-500 mb-4">Cet evenement est un match.</p>
        <Link to={`/matchs/${evenement.match.id}`} className="btn-primary">Voir le match</Link>
      </div>
    );
  }

  const maReponse = evenement.reponses.find((r: any) => r.utilisateurId === user?.id)?.reponse;
  const presents = evenement.reponses.filter((r: any) => r.reponse === 'present');
  const absents = evenement.reponses.filter((r: any) => r.reponse === 'absent');
  const peutEtre = evenement.reponses.filter((r: any) => r.reponse === 'peut-etre');

  async function handleReponse(reponse: string) {
    setActionLoading(true);
    await api.post('/reponses', { evenementId: Number(id), reponse });
    fetchData();
    setActionLoading(false);
  }

  async function handleDelete() {
    if (!confirm('Supprimer cet evenement ?')) return;
    setActionLoading(true);
    await api.del(`/evenements/${id}`);
    navigate('/evenements');
  }

  return (
    <div>
      <Link to="/evenements" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour</Link>

      <div className="flex justify-between items-start mt-2 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">{evenement.entitule}</h1>
          <p className="text-sm text-gray-400">{evenement.sport.nom} — {evenement.participants} participant(s)</p>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} disabled={actionLoading} className="btn-danger">
            {actionLoading ? '...' : 'Supprimer'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">Details</div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Date :</span> {new Date(evenement.dateHeure).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}</p>
              <p><span className="text-gray-400">Sport :</span> {evenement.sport.nom}</p>
              <p><span className="text-gray-400">Participants :</span> {evenement.participants}</p>
              {evenement.description && (
                <p><span className="text-gray-400">Description :</span> {evenement.description}</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Reponses ({evenement.reponses.length})</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Presents ({presents.length})</h4>
                {presents.map((r: any) => <p key={r.id} className="text-gray-600">{r.utilisateur.prenom} {r.utilisateur.nom}</p>)}
              </div>
              <div>
                <h4 className="font-medium text-yellow-600 mb-2">Peut-etre ({peutEtre.length})</h4>
                {peutEtre.map((r: any) => <p key={r.id} className="text-gray-600">{r.utilisateur.prenom} {r.utilisateur.nom}</p>)}
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-2">Absents ({absents.length})</h4>
                {absents.map((r: any) => <p key={r.id} className="text-gray-600">{r.utilisateur.prenom} {r.utilisateur.nom}</p>)}
              </div>
            </div>
          </div>
        </div>

        <div className="card h-fit">
          <div className="card-header">Ma reponse</div>
          <div className="space-y-2">
            {reponseOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleReponse(opt.value)}
                disabled={actionLoading}
                className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${opt.className} ${
                  maReponse === opt.value ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-70'
                }`}
              >
                {maReponse === opt.value && '* '}{opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
