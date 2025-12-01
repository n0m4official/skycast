export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao")?.toUpperCase();

  if (!icao) return Response.json({ error: "Missing ICAO" }, { status: 400 });

  const isUSA = icao.startsWith("K");

  if (!isUSA)
    return Response.json(
      { region_supported: false, notams: [] },
      { status: 200 }
    );

  try {
    const url = `https://api.flightplandatabase.com/nav/notams/${icao}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("FAA NOTAM API error");

    const data = await res.json();

    return Response.json(
      {
        region_supported: true,
        notams: data.notams ?? []
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("FAA NOTAM ERROR:", err);
    return Response.json({ region_supported: false, notams: [] }, { status: 200 });
  }
}
