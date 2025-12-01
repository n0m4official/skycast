"use client";

import { useTaf } from "../lib/useAviationData";

export default function TafTimeline({ icao }) {
  const { data, error, isLoading } = useTaf(icao);

  if (isLoading) return <div className="p-4 border rounded-md shadow">Loading TAF...</div>;
  if (error) return <div className="p-4 border rounded-md shadow text-red-500">TAF unavailable.</div>;

  if (!data?.raw_text)
    return <div className="p-4 border rounded-md shadow">No TAF available.</div>;

  return (
    <div className="p-4 border rounded-md shadow">
      <h2 className="text-xl font-semibold">TAF</h2>
      <pre className="font-mono text-sm whitespace-pre-wrap">{data.raw_text}</pre>
    </div>
  );
}
