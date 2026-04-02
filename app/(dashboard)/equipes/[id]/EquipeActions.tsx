"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EquipeActions({ equipeId }: { equipeId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer cette equipe ? Cette action est irreversible.")) return;
    setLoading(true);
    await fetch(`/api/equipes/${equipeId}`, { method: "DELETE" });
    router.push("/equipes");
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? "..." : "Supprimer"}
    </button>
  );
}
