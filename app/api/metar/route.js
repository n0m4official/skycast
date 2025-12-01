export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) {
    return Response.json({ error: "Missing ICAO" }, { status: 400 });
  }

  try {
    // USA airports → NOAA TXT (Perfect)
    if (icao.startsWith("K")) {
      const url = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${icao}.TXT`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) throw new Error("NOAA METAR not found");

      const text = await res.text();
      const lines = text.trim().split("\n");

      return Response.json(
        {
          raw_text: lines[1] ?? null,
          observed: lines[0] ?? null,
          flight_category: null,
        },
        { status: 200 }
      );
    }

    // INTERNATIONAL → AVWX public failover
    const url = `https://avwx.rest/api/metar/${icao}?format=json&onfail=cache`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SkyCast Student Project" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("AVWX error");

    const data = await res.json();

    return Response.json(
      {
        raw_text: data.raw || null,
        observed: data.time?.dt || null,
        flight_category: data.flight_category || null,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("METAR API ERROR:", err);

    return Response.json(
      {
        raw_text: null,
        observed: null,
        flight_category: null,
        error: "METAR lookup failed",
      },
      { status: 200 }
    );
  }
}
