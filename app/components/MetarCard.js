"use client";

import { useMetar } from "../libs/useAviationData";
import StatusBadge from "./StatusBadge";

export default function MetarCard({ icao }) {
  const { data, error, isLoading } = useMetar(icao);

  if (isLoading) return <div className="p-4">Loading METAR...</div>
  if (error) return <div className="p-4 text-red-500">Error loading METAR.</div>
  if (!data || data.length === 0) return <div>No METAR data available.</div>

  const metar = data[0];

  return (
    <div className="p-4 border rounded-md shadown">
      <h2 className="text-xl front-semibold mb-2">METAR</h2>
      
      <StatusBadge metar={metar} />

      <p className="text-gray-700 mt-2">{metar.raw}</p>
    </div>
  );
}