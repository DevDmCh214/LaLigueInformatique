import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function EvenementNewPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<{ id: number; nom: string }[]>([]);
  const [form, setForm] = useState({ entitule: '', participants: 10, dateHeure: '', description: '', sportId: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<any[]>('/sports').then((data) => {
      setSports(data);
      if (data.length > 0) setForm((f) => ({ ...f, sportId: data[0].id }));
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ev = await api.post<any>('/evenements', form);
      navigate(`/evenements/${ev.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/evenements" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour</Link>
      <h1 className="text-xl font-semibold text-gray-700 mt-2 mb-5">Nouvel evenement</h1>

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
            <label className="block text-sm text-gray-500 mb-1">Titre</label>
            <input type="text" value={form.entitule} onChange={(e) => setForm({ ...form, entitule: e.target.value })} required className="input" placeholder="Ex: Entrainement collectif" />
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
            {loading ? 'Creation...' : "Creer l'evenement"}
          </button>
        </form>
      </div>
    </div>
  );
}
