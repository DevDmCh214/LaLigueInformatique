import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function EquipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [equipe, setEquipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add membre form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState('');

  const fetchData = () => {
    api.get<any>(`/equipes/${id}`).then(setEquipe).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  async function handleDelete() {
    if (!confirm('Supprimer cette equipe ? Cette action est irreversible.')) return;
    setActionLoading(true);
    await api.del(`/equipes/${id}`);
    navigate('/equipes');
  }

  async function handleAddMembre(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setActionLoading(true);
    try {
      await api.post(`/equipes/${id}/membres`, { email: addEmail });
      setAddEmail('');
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      setAddError(err.message || 'Erreur');
    }
    setActionLoading(false);
  }

  async function handleRemoveMembre(utilisateurId: number) {
    if (!confirm("Retirer ce membre de l'equipe ?")) return;
    setActionLoading(true);
    await api.del(`/equipes/${id}/membres`, { utilisateurId });
    fetchData();
    setActionLoading(false);
  }

  async function handleJoin() {
    setActionLoading(true);
    try {
      await api.post(`/equipes/${id}/join`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erreur');
    }
    setActionLoading(false);
  }

  async function handleLeave() {
    if (!confirm('Quitter cette equipe ?')) return;
    setActionLoading(true);
    await api.del(`/equipes/${id}/leave`);
    fetchData();
    setActionLoading(false);
  }

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!equipe) return <p className="text-gray-400">Equipe non trouvee.</p>;

  const placesRestantes = equipe.nombrePlaces - equipe.membres.length;
  const isMembre = equipe.membres.some((m: any) => m.utilisateurId === user?.id);

  return (
    <div>
      <Link to="/equipes" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux equipes</Link>
      <div className="flex justify-between items-center mt-2 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-700">{equipe.nom}</h1>
          <p className="text-sm text-gray-400">
            {equipe.sport?.nom} — {equipe.membres.length}/{equipe.nombrePlaces} membres
            {placesRestantes > 0 ? ` (${placesRestantes} place(s) restante(s))` : ' (complet)'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isAdmin && !isMembre && placesRestantes > 0 && (
            <button onClick={handleJoin} disabled={actionLoading} className="btn-primary">
              {actionLoading ? '...' : 'Rejoindre'}
            </button>
          )}
          {!isAdmin && isMembre && (
            <button onClick={handleLeave} disabled={actionLoading} className="btn-secondary">
              {actionLoading ? '...' : 'Quitter'}
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDelete} disabled={actionLoading} className="btn-danger">
              {actionLoading ? '...' : 'Supprimer'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">Membres</div>
            {equipe.membres.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun membre.</p>
            ) : (
              <table>
                <thead><tr><th>Nom</th><th>Email</th>{isAdmin && <th></th>}</tr></thead>
                <tbody>
                  {equipe.membres.map((m: any) => (
                    <tr key={m.id}>
                      <td>
                        {m.utilisateur.prenom} {m.utilisateur.nom}
                        {m.utilisateurId === user?.id && <span className="text-xs text-gray-400 ml-1">(vous)</span>}
                      </td>
                      <td>{m.utilisateur.email}</td>
                      {isAdmin && (
                        <td className="text-right">
                          <button
                            onClick={() => handleRemoveMembre(m.utilisateurId)}
                            disabled={actionLoading}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Retirer
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {isAdmin && placesRestantes > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {!showAddForm ? (
                  <button onClick={() => setShowAddForm(true)} className="btn-secondary text-xs">
                    + Ajouter un membre
                  </button>
                ) : (
                  <form onSubmit={handleAddMembre} className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-600">Ajouter un membre</h4>
                    {addError && <p className="text-red-500 text-xs">{addError}</p>}
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        placeholder="Email de l'utilisateur"
                        required
                        className="input flex-1"
                      />
                      <button type="submit" disabled={actionLoading} className="btn-primary">
                        {actionLoading ? '...' : 'Ajouter'}
                      </button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Matchs ({equipe.participations.length})</div>
          {equipe.participations.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun match.</p>
          ) : (
            <div className="space-y-2">
              {equipe.participations.map((p: any) => {
                const adversaire = p.match.equipesParticipantes.find(
                  (ep: any) => ep.equipeId !== equipe.id
                );
                return (
                  <Link
                    key={p.id}
                    to={`/matchs/${p.match.id}`}
                    className="block p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-700 text-sm">{p.match.evenement.entitule}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      vs {adversaire?.equipe.nom || '?'} — {new Date(p.match.evenement.dateHeure).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {p.match.equipeGagnante && (
                      <span className={p.match.equipeGagnante.id === equipe.id ? 'badge-green mt-1' : 'badge-red mt-1'}>
                        {p.match.equipeGagnante.id === equipe.id ? 'Victoire' : 'Defaite'}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
