"use client";

export default function MetarSidePanel({
  open,
  onClose,
  token,
  label,
  info
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">

      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="w-96 bg-gray-900 text-gray-100 shadow-xl border-l border-gray-700 p-5 overflow-y-auto animate-slideLeft">

        {/* Title */}
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          {info?.icon} {token}
        </h2>
        <p className="text-blue-300 text-sm mb-4">{label}</p>

        {/* BEGINNER SECTION */}
        <h3 className="text-lg font-semibold mt-3 mb-1">Easy Explanation</h3>
        <p className="text-gray-300 text-sm whitespace-pre-line">
          {info?.beginner}
        </p>

        {/* AUTO-DECODED VALUES */}
        {info?.decoded && (
          <>
            <h3 className="text-lg font-semibold mt-4 mb-1">Decoded Values</h3>
            <div className="bg-gray-800 p-3 rounded border border-gray-700 text-sm">
              {Object.entries(info.decoded).map(([key, val]) => (
                <p key={key} className="text-gray-200">
                  <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {val}
                </p>
              ))}
            </div>
          </>
        )}

        {/* AVIATION SECTION */}
        <h3 className="text-lg font-semibold mt-4 mb-1">Advanced Aviation Info</h3>
        <p className="text-gray-400 text-sm whitespace-pre-line">
          {info?.advanced}
        </p>

        {/* PILOT INTERPRETATION */}
        {info?.meaning && (
          <>
            <h3 className="text-lg font-semibold mt-4 mb-1">What This Means for Pilots</h3>
            <p className="text-gray-300 text-sm whitespace-pre-line">
              {info.meaning}
            </p>
          </>
        )}

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
