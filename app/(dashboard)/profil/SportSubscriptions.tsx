"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SportSubscriptions({
  allSports,
  inscritIds,
}: {
  allSports: { id: number; nom: string }[];
  inscritIds: number[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  async function toggle(sportId: number, isInscrit: boolean) {
    setLoading(sportId);
    await fetch("/api/inscriptions", {
      method: isInscrit ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sportId }),
    });
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {allSports.map((sport) => {
        const isInscrit = inscritIds.includes(sport.id);
        return (
          <button
            key={sport.id}
            onClick={() => toggle(sport.id, isInscrit)}
            disabled={loading === sport.id}
            className={`p-3 rounded border text-sm font-medium transition-all ${
              isInscrit
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            {sport.nom}
            {isInscrit && <span className="block text-xs mt-1">Inscrit</span>}
            {!isInscrit && <span className="block text-xs mt-1 text-gray-400">Cliquer pour s'inscrire</span>}
          </button>
        );
      })}
      {allSports.length === 0 && (
        <p className="text-gray-400 text-sm col-span-full">Aucun sport disponible.</p>
      )}
    </div>
  );
}
