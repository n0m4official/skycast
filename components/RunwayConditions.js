"use client";

import { useAirport, useMetar } from "../lib/useAviationData";

export default function RunwayConditions({ icao }) {
  const { data: airport } = useAirport(icao);
  const { data: metar } = useMetar(icao);

  if (!airport || !metar)
    return <div className="p-4 border rounded-md shadow">Loading runway data...</div>;

  const runways = airport.runways ?? [];
  const windDir = metar.windDir;
  const windSpeed = metar.windSpeed;

  if (!windDir || !windSpeed)
    return <div className="p-4 border rounded-md shadow text-gray-500">Crosswind unavailable</div>;

  return (
    <div className="p-4 border rounded-md shadow space-y-2">
      <h2 className="text-xl font-semibold">Runway Crosswind</h2>

      {runways.map((r, i) => {
        const heading = Number(r.le_heading_degT);
        const angle = Math.abs(heading - windDir);
        const crosswind = Math.abs(windSpeed * Math.sin(angle * Math.PI / 180));

        return (
          <div key={i} className="p-2 bg-gray-100 rounded border">
            <p className="font-semibold">
              Runway {r.le_ident}/{r.he_ident}
            </p>
            <p>Crosswind: {crosswind.toFixed(1)} kt</p>
          </div>
        );
      })}
    </div>
  );
}
