export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) {
    return Response.json({ error: "Missing ICAO" }, { status: 400 });
  }

  try {
    // Get the global airports CSV
    const res = await fetch("https://ourairports.com/data/airports.csv", {
      cache: "no-store"
    });

    if (!res.ok) throw new Error("OurAirports CSV unavailable");

    const csv = await res.text();
    const lines = csv.split("\n");

    // Find matching row (ICAO is col 2, wrapped in quotes)
    const row = lines.find(line => line.includes(`"${icao}"`));

    if (!row) {
      return Response.json(
        { error: "Airport not found" },
        { status: 404 }
      );
    }

    const cols = row.split(",");

    return Response.json(
      {
        icao,
        name: cols[3]?.replace(/"/g, "") || icao,
        latitude: Number(cols[4]),
        longitude: Number(cols[5]),
        elevation: Number(cols[6]),
        runways: []
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("AIRPORT API ERROR:", err);
    return Response.json({ error: "API failure" }, { status: 500 });
  }
}
