import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function EquipeNewPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<{ id: number; nom: string }[]>([]);
  const [nom, setNom] = useState('');
  const [nombrePlaces, setNombrePlaces] = useState(11);
  const [sportId, setSportId] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<any[]>('/sports').then((data) => {
      setSports(data);
      if (data.length > 0) setSportId(data[0].id);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const equipe = await api.post<any>('/equipes', { nom, nombrePlaces, sportId });
      navigate(`/equipes/${equipe.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/equipes" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux equipes</Link>
      <h1 className="text-xl font-semibold text-gray-700 mt-2 mb-5">Nouvelle equipe</h1>

      <div className="card max-w-md">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Sport</label>
            <select value={sportId} onChange={(e) => setSportId(Number(e.target.value))} required className="input">
              {sports.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nom de l'equipe</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="input" placeholder="Ex: FC Paris" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nombre de places</label>
            <input type="number" value={nombrePlaces} onChange={(e) => setNombrePlaces(Number(e.target.value))} min={1} required className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creation...' : "Creer l'equipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
