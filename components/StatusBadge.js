"use client";

export default function StatusBadge({ metar }) {
  if (!metar) return null;

  return (
    <span className="inline-block px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
      {metar.flight_category || "N/A"}
    </span>
  );
}
