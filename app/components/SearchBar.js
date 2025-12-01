"use client";

import { useState } from "react";
import { useRouter } from "next/router";

export default function SearchBar() {
  const [icao, setIcao] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!icao.trim()) return;

    router.push(`/airport/${icao.toUpperCase()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="ICAO (e.g., CYYC)"
        className="border px-3 py-2 rounded-md uppercase tracking-widest"
        value={icao}
        onChange={(e) => setIcao(e.target.value)}
        maxLength={4}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Search
      </button>
    </form>
  );
}