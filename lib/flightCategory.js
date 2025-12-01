// Extract ceiling from forecast text: BKN015, OVC004, SCT020, etc.
function extractCeiling(text) {
  const match = text.match(/(BKN|OVC)(\d{3})/);
  if (!match) return null;
  return parseInt(match[2]) * 100; // convert to feet
}

// Extract visibility: "5SM" or "P6SM"
function extractVis(text) {
  const match = text.match(/(\d+)?SM|P6SM/);
  if (!match) return 10; // assume best vis if missing
  if (match[0] === "P6SM") return 6;
  return parseInt(match[1]) || 0;
}

export function getFlightCategory(text) {
  const vis = extractVis(text);
  const ceiling = extractCeiling(text) ?? 99999;

  if (ceiling < 500 || vis < 1) return "LIFR";
  if (ceiling < 1000 || vis < 3) return "IFR";
  if (ceiling < 3000 || vis < 5) return "MVFR";
  return "VFR";
}

export const categoryColors = {
  VFR: "bg-green-500",
  MVFR: "bg-blue-500",
  IFR: "bg-red-500",
  LIFR: "bg-purple-600"
};