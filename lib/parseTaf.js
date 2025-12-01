export function parseTaf(rawTaf) {
  if (!rawTaf) return [];

  // Remove the first line (TAF header)
  const lines = rawTaf.split("\n").map((l) => l.trim());
  let full = lines.join(" ");

  // Strip "TAF", station, date, issue time
  full = full.replace(/^TAF\s+\w+\s+\d{6}Z\s+/, "");

  const segments = [];
  const regex =
    /(FM\d{6}|TEMPO\s+\d{4}\/\d{4}|PROB\d{2}\s+\d{4}\/\d{4})/g;
  
  let matches = [...full.matchAll(regex)];

  // If first forecast exists before any group
  if (matches.length > 0) {
    const first = full.substring(0, matches[0].index).trim();
    if (first.length > 0) {
      segments.push({
        type: "BASE",
        text: first
      });
    }
  }

  for (let i = 0; i < matches.length; i++)
  {
    const tag = matches[i][0];
    const start = matches[i].index;
    const end = matches[i + 1]?.index ?? full.length;

    const text = full.substring(start, end).trim();

    segments.push({
      type: tag.startsWith("FM")
        ? "FM"
        : tag.startsWith("TEMPO")
        ? "TEMPO"
        : "PROB",
      tag,
      text,
    });
  }

  return segments;
}