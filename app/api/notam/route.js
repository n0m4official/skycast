export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const icao = searchParams.get("icao");

  if (!icao) {
    return new Response(JSON.stringify({ error: "Missing ICAO code" }), {
      status: 400,
    });
  }

  try {
    const url = `https://notams.aim.faa.gov/notamSearch/search?searchType=icao&icao=${icao}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("NOTAM API error");

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
