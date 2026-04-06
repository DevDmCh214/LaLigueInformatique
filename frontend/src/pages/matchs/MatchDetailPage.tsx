import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const reponseOptions = [
  { value: 'present', label: 'Present', className: 'bg-green-500 hover:bg-green-600 text-white' },
  { value: 'peut-etre', label: 'Peut-etre', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { value: 'absent', label: 'Absent', className: 'bg-red-500 hover:bg-red-600 text-white' },
] as const;

export default function MatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    api.get<any>(`/matchs/${id}`).then(setMatch).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!match) return <p className="text-gray-400">Match non trouve.</p>;

  const ev = match.evenement;
  const maReponse = ev.reponses.find((r: any) => r.utilisateurId === user?.id)?.reponse;
  const presents = ev.reponses.filter((r: any) => r.reponse === 'present');
  const absents = ev.reponses.filter((r: any) => r.reponse === 'absent');
  const peutEtre = ev.reponses.filter((r: any) => r.reponse === 'peut-etre');
  const equipes = match.equipesParticipantes.map((ep: any) => ep.equipe);
  const allTeamMemberIds = new Set(
    match.equipesParticipantes.flatMap((ep: any) => ep.equipe.membres?.map((m: any) => m.utilisateurId) || [])
  );
  const isInTeam = user?.id ? allTeamMemberIds.has(user.id) : false;

  async function handleReponse(reponse: string) {
    setActionLoading(true);
    await api.post('/reponses', { evenementId: ev.id, reponse });
    fetchData();
    setActionLoading(false);
  }

  async function setWinner(equipeId: number | null) {
    setActionLoading(true);
    await api.put(`/matchs/${id}`, { equipeGagnanteId: equipeId });
    fetchData();
    setActionLoading(false);
  }

  return (
    <div>
      <Link to="/matchs" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour</Link>

      <div className="flex justify-between items-start mt-2 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">{ev.entitule}</h1>
          <p className="text-sm text-gray-400">{ev.sport.nom} — Match</p>
        </div>
        {isAdmin && (
          <button
            onClick={async () => {
              if (!confirm('Supprimer ce match ?')) return;
              setActionLoading(true);
              await api.del(`/matchs/${id}`);
              navigate('/matchs');
            }}
            disabled={actionLoading}
            className="btn-danger"
          >
            {actionLoading ? '...' : 'Supprimer'}
          </button>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-center gap-8 py-4">
          {equipes.map((eq: any) => (
            <div key={eq.id} className="text-center">
              <Link to={`/equipes/${eq.id}`} className="text-lg font-bold text-gray-700 hover:underline">
                {eq.nom}
              </Link>
              {match.equipeGagnante?.id === eq.id && (
                <p className="badge-green mt-1 inline-block">Gagnant</p>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (() => {
          const canSetWinner = presents.length >= ev.participants;
          return (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Definir le gagnant :</p>
              {!canSetWinner && !match.equipeGagnanteId && (
                <p className="text-xs text-yellow-600 mb-2">
                  En attente: {presents.length}/{ev.participants} participants presents
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                {equipes.map((eq: any) => (
                  <button
                    key={eq.id}
                    onClick={() => setWinner(eq.id)}
                    disabled={actionLoading || (!canSetWinner && !match.equipeGagnanteId)}
                    className={`btn ${
                      match.equipeGagnanteId === eq.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    } ${!canSetWinner && !match.equipeGagnanteId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {eq.nom}
                  </button>
                ))}
                {match.equipeGagnanteId && (
                  <button onClick={() => setWinner(null)} disabled={actionLoading} className="btn-secondary">
                    Retirer
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">Details</div>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Date :</span> {new Date(ev.dateHeure).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}</p>
              <p><span className="text-gray-400">Sport :</span> {ev.sport.nom}</p>
              <p><span className="text-gray-400">Participants :</span> {ev.participants}</p>
              {ev.description && <p><span className="text-gray-400">Description :</span> {ev.description}</p>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Reponses ({ev.reponses.length})</div>
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

        {isInTeam && (
          <div className="card h-fit">
            <div className="card-header">Ma reponse</div>
            <div className="space-y-2">
              {reponseOptions.map((opt) => {
                const isFull = opt.value === 'present' && maReponse !== 'present' && presents.length >= ev.participants;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleReponse(opt.value)}
                    disabled={actionLoading || isFull}
                    className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${opt.className} ${
                      maReponse === opt.value ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-70'
                    } ${isFull ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {maReponse === opt.value && '* '}{opt.label}{isFull ? ' (complet)' : ''}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-3 px-4 py-2 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
