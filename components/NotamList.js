"use client";

import { useNotam } from "../lib/useAviationData";
import NotamItem from "./NotamItem";

export default function NotamList({ icao }) {
  const { data, error, isLoading } = useNotam(icao);

  if (isLoading) return <div className="p-4 border rounded-md shadow">Loading NOTAMs...</div>;
  if (error) return <div className="p-4 border rounded-md shadow text-red-500">NOTAM error.</div>;

  if (!data.region_supported)
    return <div className="p-4 border rounded-md shadow">NOTAMs not supported for this region.</div>;

  if (!data.notams.length)
    return <div className="p-4 border rounded-md shadow">No NOTAMs available.</div>;

  return (
    <div className="p-4 border rounded-md shadow space-y-2">
      <h2 className="text-xl font-semibold mb-2">NOTAMs</h2>
      {data.notams.map((n, i) => <NotamItem key={i} notam={n} />)}
    </div>
  );
}
