"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EvenementActions({ evenementId }: { evenementId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer cet evenement ?")) return;
    setLoading(true);
    await fetch(`/api/evenements/${evenementId}`, { method: "DELETE" });
    router.push("/evenements");
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? "..." : "Supprimer"}
    </button>
  );
}
