"use client";

export default function MetarSidePanel({ open, onClose, token, label, desc}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background dimmer */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-80 bg-gray-900 text-gray-100 shadow-xl border-l border-gray-700 p-5 animate-slideLeft">
        <h2 className="text-xl font-bold mb-2">{token}</h2>
        <p className="text-blue-300 mb-4">{label}</p>
        <p className="text-gray-300 text-sm whitespace-pre-line mb-4">
          {desc}
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
