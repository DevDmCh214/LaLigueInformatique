import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function SportNewPage() {
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sport = await api.post<any>('/sports', { nom });
      navigate(`/sports/${sport.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setLoading(false);
    }
  }

  return (
    <div>
      <Link to="/sports" className="text-sm text-gray-400 hover:text-gray-600">&larr; Retour aux sports</Link>
      <h1 className="text-xl font-semibold text-gray-700 mt-2 mb-5">Nouveau sport</h1>

      <div className="card max-w-md">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nom du sport</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="input" placeholder="Ex: Football, Basketball..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creation...' : 'Creer le sport'}
          </button>
        </form>
      </div>
    </div>
  );
}
