import { useState } from "react"
import type { Planet } from "./types/Planet";
import PlanetCard from "./components/PlanetCard";
import { getVisiblePlanets } from "./services/astronomyApi";

function App() {

  const [planets, setPlanets] = useState<Record<string, Planet> | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const getLocation = () => {

  setLocationLoading(true)

  navigator.geolocation.getCurrentPosition(

    (position) => {

      setLatitude(position.coords.latitude)

      setLongitude(position.coords.longitude)

      setLocationLoading(false)

      console.log(position.coords.latitude)
      console.log(position.coords.longitude)
    },

    (error) => {

      console.error(error)

      setLocationLoading(false)
    }
  )
}

  const loadPlanets = async () => {

    setLoading(true)

    if (latitude === null || longitude === null) {
      alert("Please get your location first.")
      return
    }

    const data = await getVisiblePlanets(latitude, longitude);

    console.log(data)

    setPlanets(data)
    setLastUpdated(new Date().toLocaleString())
    setLoading(false)
}

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-4xl font-bold mb-6">
        Astronomy Observation Platform
      </h1>

      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md">

        <h2 className="text-2xl mb-4">
          Visible Planets
        </h2>

        <button
          onClick={getLocation}
          disabled={locationLoading}
          className="bg-green-500 px-4 py-2 rounded-lg mr-4"
        >
          {locationLoading
            ? "Getting Location..."
            : "Get Location"}
        </button>

        <button
          onClick={loadPlanets}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          Load Planets
        </button>

        <div className="mt-4">

          <p>
            Latitude: {latitude ?? "Unknown"}
          </p>

          <p>
            Longitude: {longitude ?? "Unknown"}
          </p>

        </div>

        <p className="mt-4 text-gray-400">
          Last Updated: {lastUpdated}
        </p>

        {loading && (
          <p className="mt-4">
            Loading planets...
          </p>
        )}

        {locationLoading && (
          <p className="mt-2 text-gray-400">
            Requesting location...
          </p>
        )}

        <div className="mt-6 space-y-4">

          {planets &&
            Object.entries(planets).map(([name, planet]: [string, Planet]) => (

              <PlanetCard
                  key={name}
                  name={name}
                  planet={planet}
              />

            ))
          }

        </div>

      </div>

    </div>
  )
}

export default App