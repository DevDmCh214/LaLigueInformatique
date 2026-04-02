"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventActions({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/events");
      router.refresh();
    }
  }

  return (
    <div>
      {showConfirm ? (
        <div className="flex gap-2 items-center">
          <button onClick={handleDelete} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded">Oui</button>
          <button onClick={() => setShowConfirm(false)} className="text-xs text-white/80 hover:text-white">Non</button>
        </div>
      ) : (
        <button onClick={() => setShowConfirm(true)} className="text-xs text-white/80 hover:text-white">
          Supprimer
        </button>
      )}
    </div>
  );
}
