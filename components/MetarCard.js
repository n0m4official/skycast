"use client";

import { useMetar } from "../lib/useAviationData";

export default function MetarCard({ icao }) {
  const { data, error, isLoading } = useMetar(icao);

  console.log("METAR FULL DATA:", data);

  if (isLoading) return <div className="p-4 border rounded-md shadow">Loading METAR...</div>;
  if (error) return <div className="p-4 border rounded-md shadow text-red-500">Error loading METAR.</div>;

  // NEW: check required field
  if (!data || !data.raw_text) {
    return <div className="p-4 border rounded-md shadow">No METAR available.</div>;
  }

  return (
    <div className="p-4 border rounded-md shadow">
      <h2 className="text-xl font-semibold mb-2">METAR</h2>
      <p className="font-mono text-sm">{data.raw_text}</p>
      <p className="text-gray-600 text-sm mt-2">
        Observed: {data.observed ?? "N/A"}Z
      </p>
    </div>
  );
}
