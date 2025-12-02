"use client";

import { useEffect, useState } from "react";

// METAR FETCH
export default function useAviationData(icao) {
  const [metar, setMetar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      if (!icao) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/metar?icao=${icao}`);
        const json = await res.json();
        setMetar(json || null);
      } catch (err) {
        console.error("METAR FETCH ERROR:", err);
        setMetar(null);
      }
      setLoading(false);
    }

    fetchAll();
  }, [icao]);

  return { metar, loading };
}

// AIRPORT FETCH
export function useAirport(icao) {
  const [airport, setAirport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAirport() {
      if (!icao) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/airport?icao=${icao}`);
        if (!res.ok) throw new Error("Airport fetch failed");
        const json = await res.json();
        setAirport(json);
      } catch (err) {
        console.error("AIRPORT FETCH ERROR:", err);
        setError(err);
      }
      setLoading(false);
    }

    fetchAirport();
  }, [icao]);

  return { data: airport, loading, error };
}
