import AirportHeader from "../../../components/AirportHeader";
import MetarCard from "../../../components/MetarCard";
import TafTimeline from "../../../components/TafTimeline";
import NotamList from "../../../components/NotamList";
import RunwayConditions from "../../../components/RunwayConditions";

export default function AirportPage({ params }) {
  const { icao } = params;

  return (
    <main className="min-h-screen p-6 space-y-6">
      <AirportHeader icao={icao} />
      
      <section className="grid gap-6 md:grid-cols-2">
        <MetarCard icao={icao} />
        <RunwayConditions icao={icao} />
      </section>

      <TafTimeline icao={icao} />
      
      <NotamList icao={icao} />
    </main>
  );
}