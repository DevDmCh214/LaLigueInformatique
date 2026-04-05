import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function MatchNewPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<{ id: number; nom: string }[]>([]);
  const [equipes, setEquipes] = useState<{ id: number; nom: string }[]>([]);
  const [form, setForm] = useState({
    entitule: '', participants: 22, dateHeure: '', description: '',
    sportId: 0, equipe1Id: 0, equipe2Id: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/sports'),
      api.get<any[]>('/equipes'),
    ]).then(([sportsData, equipesData]) => {
      setSports(sportsData);
      setEquipes(equipesData);
      setForm((f) => ({
        ...f,
        sportId: sportsData[0]?.id || 0,
        equipe1Id: equipesData[0]?.id || 0,
        equipe2Id: equipesData[1]?.id || 0,
      }));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.equipe1Id === form.equipe2Id) {
      setError('Les deux equipes doivent etre differentes');
      return;
    }

    setLoading(true);

    try {
      const ev = await api.post<any>('/matchs', form);
      navigate(`/matchs/${ev.match.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/matchs" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour</Link>
      <h1 className="text-xl font-semibold text-gray-700 mt-2 mb-5">Nouveau match</h1>

      <div className="card max-w-lg">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Sport</label>
            <select value={form.sportId} onChange={(e) => setForm({ ...form, sportId: Number(e.target.value) })} required className="input">
              {sports.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Titre du match</label>
            <input type="text" value={form.entitule} onChange={(e) => setForm({ ...form, entitule: e.target.value })} required className="input" placeholder="Ex: FC Paris vs OGC Nice" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Equipe 1</label>
              <select value={form.equipe1Id} onChange={(e) => setForm({ ...form, equipe1Id: Number(e.target.value) })} required className="input">
                {equipes.map((eq) => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Equipe 2</label>
              <select value={form.equipe2Id} onChange={(e) => setForm({ ...form, equipe2Id: Number(e.target.value) })} required className="input">
                {equipes.map((eq) => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Date et heure</label>
              <input type="datetime-local" value={form.dateHeure} onChange={(e) => setForm({ ...form, dateHeure: e.target.value })} required className="input" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nb participants</label>
              <input type="number" value={form.participants} onChange={(e) => setForm({ ...form, participants: Number(e.target.value) })} min={1} required className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creation...' : 'Creer le match'}
          </button>
        </form>
      </div>
    </div>
  );
}
