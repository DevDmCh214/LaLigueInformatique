"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MatchWinner({
  matchId,
  equipes,
  currentWinnerId,
}: {
  matchId: number;
  equipes: { id: number; nom: string }[];
  currentWinnerId: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setWinner(equipeId: number | null) {
    setLoading(true);
    await fetch(`/api/matchs/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipeGagnanteId: equipeId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Definir le gagnant :</p>
      <div className="flex gap-2 flex-wrap">
        {equipes.map((eq) => (
          <button
            key={eq.id}
            onClick={() => setWinner(eq.id)}
            disabled={loading}
            className={`btn ${
              currentWinnerId === eq.id
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {eq.nom}
          </button>
        ))}
        {currentWinnerId && (
          <button
            onClick={() => setWinner(null)}
            disabled={loading}
            className="btn-secondary"
          >
            Retirer
          </button>
        )}
      </div>
    </div>
  );
}
