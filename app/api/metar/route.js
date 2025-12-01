export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) {
    return Response.json({ error: "Missing ICAO" }, { status: 400 });
  }

  try {
    // USA (NOAA TEXT FEED)
    if (icao.startsWith("K")) {
      const url = `https://tgftp.nws.noaa.gov/data/observations/metar/stations/${icao}.TXT`;
      const res = await fetch(url, { cache: "no-store" });

      if (res.ok) {
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
    }

    // VATSIM METAR MIRROR
    const vatsim = await fetch(
      `https://metar.vatsim.net/metar.php?icao=${icao}`,
      {
        cache: "no-store",
        headers: {
          "User-Agent": "SkyCast/1.0 (+https://localhost)", // required
        }
      }
    );

    if (vatsim.ok) {
      const raw = (await vatsim.text()).trim();

      if (raw && !raw.includes("DOCTYPE")) {
        return Response.json(
          {
            raw_text: raw,
            observed: null,
            flight_category: null,
          },
          { status: 200 }
        );
      }
    }

    // AVWX GLOBAL FALLBACK (no key needed)
    const avwx = await fetch(
      `https://avwx.rest/api/metar/${icao}?options=summary&format=json&token=FREE`,
      {
        cache: "no-store",
        headers: { "User-Agent": "SkyCast/1.0" }
      }
    );

    if (avwx.ok) {
      const json = await avwx.json();
      return Response.json(
        {
          raw_text: json?.raw || null,
          observed: json?.time?.dtg || null,
          flight_category: json?.flight_rules || null,
        },
        { status: 200 }
      );
    }

    // -------- ALL FAILED --------
    return Response.json(
      { raw_text: null, observed: null, flight_category: null },
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
