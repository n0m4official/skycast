export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) return Response.json({ error: "Missing ICAO" }, { status: 400 });

  try {
    const url = `https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("TAF fetch error");

    const data = await res.json();
    const taf = data[0];

    return Response.json(
      {
        raw_text: taf?.raw_text ?? null,
        issue_time: taf?.issue_time ?? null
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("TAF API error:", err);
    return Response.json({ raw_text: null, issue_time: null }, { status: 200 });
  }
}
