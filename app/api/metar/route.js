export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) {
    return Response.json({ error: "Missing ICAO" }, { status: 400 });
  }

  try {
    // 1) Try NOAA for US stations (fastest)
    if (icao.startsWith("K")) {
      const noaa = await fetch(
        `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${icao}.TXT`,
        { cache: "no-store" }
      );

      if (noaa.ok) {
        const txt = await noaa.text();
        const lines = txt.trim().split("\n");

        return Response.json({
          raw_text: lines[1] || null,
          observed: lines[0] || null,
          flight_category: null
        });
      }
    }

    // 2) Global fallback — scrape aviationweather.gov
    const metarRes = await fetch(
      `https://aviationweather.gov/api/data/metar?ids=${icao}&format=raw`,
      { cache: "no-store" }
    );

    const raw = (await metarRes.text()).trim();

    if (!raw || raw.includes("Error")) {
      throw new Error("Invalid METAR");
    }

    return Response.json({
      raw_text: raw,
      observed: null,
      flight_category: null,
    });

  } catch (err) {
    console.error("METAR SCRAPER ERROR:", err);

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
