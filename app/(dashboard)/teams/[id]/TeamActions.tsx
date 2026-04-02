"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamActions({ teamId }: { teamId: number }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/teams");
      router.refresh();
    }
  }

  return (
    <div className="flex gap-2">
      {showConfirm ? (
        <div className="flex gap-2 items-center">
          <span className="text-sm text-red-500">Confirmer ?</span>
          <button onClick={handleDelete} className="btn-danger text-xs">Oui, supprimer</button>
          <button onClick={() => setShowConfirm(false)} className="btn-secondary text-xs">Annuler</button>
        </div>
      ) : (
        <button onClick={() => setShowConfirm(true)} className="btn-danger text-xs">
          Supprimer l&apos;équipe
        </button>
      )}
    </div>
  );
}
