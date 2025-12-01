import AirportHeader from "../../../components/AirportHeader";
import MetarCard from "../../../components/MetarCard";
import TafTimeline from "../../../components/TafTimeline";
import NotamList from "../../../components/NotamList";
import RunwayConditions from "../../../components/RunwayConditions";

export default async function AirportPage({ params }) {
  const { icao } = await params;

  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Airport Dashboard</h1>

      {/* Airport Section */}
      <AirportHeader icao={icao} />

      {/* METAR + Runway Conditions */}
      <section className="grid gap-6 md:grid-cols-2">
        <MetarCard icao={icao} />
        <RunwayConditions icao={icao} />
      </section>

      {/* TAF */}
      <TafTimeline icao={icao} />

      {/* NOTAMs */}
      <NotamList icao={icao} />

    </main>
  );
}
