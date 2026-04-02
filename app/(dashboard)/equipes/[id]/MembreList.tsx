"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Membre = {
  id: number;
  utilisateurId: number;
  nom: string;
  prenom: string;
  email: string;
};

export default function MembreList({
  membres,
  equipeId,
  currentUserId,
}: {
  membres: Membre[];
  equipeId: number;
  currentUserId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  async function handleRemove(utilisateurId: number) {
    if (!confirm("Retirer ce membre de l'equipe ?")) return;
    setLoading(utilisateurId);

    await fetch(`/api/equipes/${equipeId}/membres`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId }),
    });

    setLoading(null);
    router.refresh();
  }

  if (membres.length === 0) {
    return <p className="text-gray-400 text-sm">Aucun membre.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {membres.map((m) => (
          <tr key={m.id}>
            <td>
              {m.prenom} {m.nom}
              {m.utilisateurId === currentUserId && (
                <span className="text-xs text-gray-400 ml-1">(vous)</span>
              )}
            </td>
            <td>{m.email}</td>
            <td className="text-right">
              <button
                onClick={() => handleRemove(m.utilisateurId)}
                disabled={loading === m.utilisateurId}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                {loading === m.utilisateurId ? "..." : "Retirer"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
