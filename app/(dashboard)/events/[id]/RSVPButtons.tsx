"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const options = [
  { value: "going", label: "Présent", bg: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
  { value: "maybe", label: "Peut-être", bg: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" },
  { value: "not_going", label: "Absent", bg: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
];

export default function RSVPButtons({
  eventId,
  currentStatus,
}: {
  eventId: number;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRSVP(status: string) {
    setLoading(true);
    await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleRSVP(opt.value)}
          disabled={loading}
          className={`px-4 py-2 rounded border text-sm font-medium transition-all ${opt.bg} ${
            currentStatus === opt.value ? "ring-2 ring-offset-1 ring-gray-400 font-bold" : ""
          }`}
        >
          {currentStatus === opt.value ? `✓ ${opt.label}` : opt.label}
        </button>
      ))}
    </div>
  );
}
