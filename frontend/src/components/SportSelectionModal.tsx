import { useState, useEffect } from 'react';
import { api } from '../api/client';

type Sport = { id: number; nom: string };

export default function SportSelectionModal({ onComplete }: { onComplete: () => void }) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Sport[]>('/sports').then(setSports).finally(() => setLoading(false));
  }, []);

  function toggleSport(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) {
      setError('Veuillez selectionner au moins un sport.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await Promise.all(
        Array.from(selected).map((sportId) => api.post('/inscriptions', { sportId }))
      );
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Erreur');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Bienvenue !</h2>
        <p className="text-sm text-gray-500 mb-5">
          Pour commencer, choisissez au moins un sport qui vous interesse.
        </p>

        {loading ? (
          <p className="text-gray-400 text-sm">Chargement des sports...</p>
        ) : sports.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun sport disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            {sports.map((sport) => {
              const isSelected = selected.has(sport.id);
              return (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => toggleSport(sport.id)}
                  className={`p-3 rounded border text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-green-50 border-green-400 text-green-700 ring-2 ring-green-300'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {sport.nom}
                  {isSelected && <span className="block text-xs mt-1">Selectionne</span>}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || selected.size === 0}
          className="btn-primary w-full disabled:opacity-50"
        >
          {submitting ? 'Enregistrement...' : 'Confirmer ma selection'}
        </button>
      </div>
    </div>
  );
}
