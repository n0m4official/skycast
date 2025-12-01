"use client";

export default function NotamItem({ notam }) {
  return (
    <div className="p-3 border rounded bg-gray-50">
      <pre className="text-sm whitespace-pre-wrap">{notam.text ?? "Unknown NOTAM"}</pre>
    </div>
  );
}
