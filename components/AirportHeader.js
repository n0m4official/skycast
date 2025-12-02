"use client";

import { useAirport } from "../lib/useAviationData";

export default function AirportHeader({ icao }) {
  const { data, loading, error } = useAirport(icao);

  if (loading)
    return (
      <div className="p-4 border rounded-md shadow">
        Loading airport...
      </div>
    );

  if (error || !data)
    return (
      <div className="p-4 border rounded-md shadow text-red-500">
        Airport info unavailable.
      </div>
    );

  return (
    <div className="p-4 border rounded-md shadow space-y-1">
      <h2 className="text-2xl font-bold">{data.name}</h2>

      <p className="text-gray-400">
        {[data.city, data.country].filter(Boolean).join(", ")}
      </p>

      <p className="text-gray-600 text-sm">
        Elevation: {data.elevation} ft
      </p>
    </div>
  );
}
