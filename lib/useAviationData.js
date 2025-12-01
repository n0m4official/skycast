import useSWR from "swr";

const fetcher = (url) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  });

export function useMetar(icao) {
  return useSWR(icao ? `/api/metar?icao=${icao}` : null, fetcher);
}

export function useTaf(icao) {
  return useSWR(icao ? `/api/taf?icao=${icao}` : null, fetcher);
}

export function useAirport(icao) {
  return useSWR(icao ? `/api/airport?icao=${icao}` : null, fetcher);
}

export function useNotam(icao) {
  return useSWR(icao ? `/api/notam?icao=${icao}` : null, fetcher);
}
