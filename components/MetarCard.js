"use client";

import useAviationData from "../lib/useAviationData";
import MetarDecoded from "./MetarDecoded";

export default function MetarCard({ icao }) {
  const { metar, loading } = useAviationData(icao);

  return (
    <div className="p-4 bg-gray-900 text-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-3">METAR</h2>

      {loading && <p className="text-gray-400">Loading METAR...</p>}

      {!loading && (!metar || !metar.raw_text) && (
        <p className="text-red-400">
          No METAR available for {icao.toUpperCase()}.
          <br />
          (This is normal for many Canadian & international airports.)
        </p>
      )}

      {metar?.raw_text && (
        <>
          {/* Token display */}
          <MetarDecoded metar={metar} />
          <p className="mt-3 text-sm text-gray-400">
            Observed: {metar.observed || "N/A"}
          </p>
        </>
      )}
    </div>
  );
}
