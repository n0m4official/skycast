export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) {
    return Response.json({ error: "Missing ICAO" }, { status: 400 });
  }

  try {
    // ---- USA (NOAA TEXT FEED) ----
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

    // ---- INTERNATIONAL (VATSIM METAR MIRROR) ----
    const vatsimUrl = `https://metar.vatsim.net/metar.php?icao=${icao}`;
    const vatsimRes = await fetch(vatsimUrl, { cache: "no-store" });

    if (!vatsimRes.ok) throw new Error("VATSIM METAR unavailable");

    const raw = (await vatsimRes.text()).trim();

    return Response.json(
      {
        raw_text: raw.length > 0 ? raw : null,
        observed: null,
        flight_category: null,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("METAR API ERROR:", err);
    return Response.json(
      { raw_text: null, observed: null, flight_category: null },
      { status: 200 }
    );
  }
}
