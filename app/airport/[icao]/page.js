import MetarDecoded from "@/components/MetarDecoded";
import AirportHeader from "../../../components/AirportHeader";
import MetarCard from "../../../components/MetarCard";

export default async function AirportPage({ params }) {
  const { icao } = await params;

  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Airport Dashboard</h1>

      {/* Airport Section */}
      <AirportHeader icao={icao} />

      {/* METAR */}
      <MetarCard icao={icao} />
      <MetarDecoded icao={icao}/>

    </main>
  );
}