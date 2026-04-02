"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const options = [
  { value: "present", label: "Present", className: "bg-green-500 hover:bg-green-600 text-white" },
  { value: "peut-etre", label: "Peut-etre", className: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  { value: "absent", label: "Absent", className: "bg-red-500 hover:bg-red-600 text-white" },
] as const;

export default function ReponseButtons({
  evenementId,
  currentReponse,
}: {
  evenementId: number;
  currentReponse?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReponse(reponse: string) {
    setLoading(true);
    await fetch("/api/reponses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evenementId, reponse }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleReponse(opt.value)}
          disabled={loading}
          className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${opt.className} ${
            currentReponse === opt.value ? "ring-2 ring-offset-1 ring-gray-400" : "opacity-70"
          }`}
        >
          {currentReponse === opt.value && "* "}{opt.label}
        </button>
      ))}
    </div>
  );
}
