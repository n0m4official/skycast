import SearchBar from "../components/SearchBar";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">SkyCast</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Enter an ICAO airport code to view METARs.
      </p>
      <SearchBar />
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Note: as of now, only airports with the prefix K (US Airports) are usable.
      </p>
    </main>
  );
}