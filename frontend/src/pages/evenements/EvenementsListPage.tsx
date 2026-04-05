import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function EvenementsListPage() {
  const [evenements, setEvenements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/evenements').then(setEvenements).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Chargement...</p>;

  const now = new Date();
  const futurs = evenements.filter((e) => new Date(e.dateHeure) >= now);
  const passes = evenements.filter((e) => new Date(e.dateHeure) < now);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-700">Evenements</h1>
        <div className="flex gap-2">
          <Link to="/evenements/new" className="btn-primary text-xs">+ Evenement</Link>
          <Link to="/matchs/new" className="btn-primary text-xs">+ Match</Link>
        </div>
      </div>

      <h2 className="text-base font-semibold text-gray-600 mb-3">A venir ({futurs.length})</h2>
      {futurs.length === 0 ? (
        <p className="text-gray-400 text-sm mb-6">Aucun evenement a venir.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {futurs.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      )}

      {passes.length > 0 && (
        <>
          <h2 className="text-base font-semibold text-gray-600 mb-3">Passes ({passes.length})</h2>
          <div className="space-y-2 opacity-60">
            {passes.map((ev) => <EventCard key={ev.id} ev={ev} />)}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ ev }: { ev: any }) {
  const maReponse = ev.reponses?.[0]?.reponse;
  return (
    <Link
      to={ev.match ? `/matchs/${ev.match.id}` : `/evenements/${ev.id}`}
      className="card flex justify-between items-center hover:shadow-md hover:border-gray-400 transition-all"
    >
      <div>
        <h3 className="font-medium text-gray-700 text-sm">{ev.entitule}</h3>
        <p className="text-xs text-gray-400">
          {ev.sport.nom} — {new Date(ev.dateHeure).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
          })}
          {' — '}{ev.participants} participant(s)
        </p>
        {ev.match && (
          <p className="text-xs text-gray-500 mt-1">
            {ev.match.equipesParticipantes.map((ep: any) => ep.equipe.nom).join(' vs ')}
            {ev.match.equipeGagnante && ` — Gagnant: ${ev.match.equipeGagnante.nom}`}
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {maReponse && (
          <span className={
            maReponse === 'present' ? 'badge-green' :
            maReponse === 'absent' ? 'badge-red' : 'badge-yellow'
          }>
            {maReponse === 'present' ? 'Present' : maReponse === 'absent' ? 'Absent' : 'Peut-etre'}
          </span>
        )}
        <span className={ev.match ? 'badge-blue' : 'badge-green'}>
          {ev.match ? 'Match' : 'Evenement'}
        </span>
      </div>
    </Link>
  );
}
