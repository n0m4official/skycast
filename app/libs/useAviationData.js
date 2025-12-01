import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export function useMetar(icao) {
  return useSWR(`/api/metar?icao=${icao}`, fetcher);
}

export function useTaf(icao) {
  return useSWR(`/api/taf?icao=${icao}`, fetcher);
}

export function useNotam(icao) {
  return useSWR(`/api/notam?icao=${icao}`, fetcher);
}