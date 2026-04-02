"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SportActions({ sportId, isInscrit }: { sportId: number; isInscrit: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleInscription() {
    setLoading(true);
    await fetch("/api/inscriptions", {
      method: isInscrit ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sportId }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce sport ? Tous les evenements associes seront perdus.")) return;
    setLoading(true);
    await fetch(`/api/sports/${sportId}`, { method: "DELETE" });
    router.push("/sports");
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={toggleInscription}
        disabled={loading}
        className={isInscrit ? "btn-secondary" : "btn-primary"}
      >
        {loading ? "..." : isInscrit ? "Se desinscrire" : "S'inscrire"}
      </button>
      <button onClick={handleDelete} disabled={loading} className="btn-danger">
        Supprimer
      </button>
    </div>
  );
}
