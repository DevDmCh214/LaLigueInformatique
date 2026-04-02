"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMembreForm({ equipeId }: { equipeId: number }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!show) {
    return (
      <button onClick={() => setShow(true)} className="btn-secondary text-xs">
        + Ajouter un membre
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/equipes/${equipeId}/membres`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur");
      setLoading(false);
      return;
    }

    setEmail("");
    setShow(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-sm font-medium text-gray-600">Ajouter un membre</h4>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email de l'utilisateur"
          required
          className="input flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "..." : "Ajouter"}
        </button>
        <button type="button" onClick={() => setShow(false)} className="btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  );
}
