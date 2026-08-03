import { useState } from "react"
import type { Planet } from "./types/Planet";
import PlanetCard from "./components/PlanetCard";
import {
    getVisiblePlanets,
    getWeather,
    getSun,
    getObservationScore
} from "./services/astronomyApi";
import type { Weather } from "./types/Weather";
import WeatherCard from "./components/WeatherCard";
import type { Sun } from "./types/Sun";
import SunCard from "./components/SunCard";
import type { ObservationScore } from "./types/ObservationScore";
import ObservationScoreCard from "./components/ObservationScoreCard";

function App() {

  const [planets, setPlanets] = useState<Record<string, Planet> | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [weather, setWeather] = useState<Weather | null>(null);
  const [sun, setSun] = useState<Sun | null>(null);
  const [observationScore, setObservationScore] = useState<ObservationScore | null>(null);

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
      setLoading(false)
      return
    }

    try {
      const [
          planetData,
          weatherData,
          sunData,
          observationData
      ] = await Promise.all([
          getVisiblePlanets(latitude, longitude),
          getWeather(latitude, longitude),
          getSun(latitude, longitude),
          getObservationScore(latitude, longitude)
      ]);

      setPlanets(planetData)
      setWeather(weatherData);
      setSun(sunData);
      setObservationScore(observationData);
      setLastUpdated(new Date().toLocaleString())

    } catch (error) {
      console.error(error);
      alert("Failed to load astronomy data.");

    } finally {
      setLoading(false)
    }
}

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto p-8">

        {/* ---------- Header ---------- */}

        <h1 className="text-5xl font-bold mb-2">
          Astronomy Observation Platform
        </h1>

        <p className="text-gray-400 mb-8">
          View current observing conditions based on your location.
        </p>

        {/* ---------- Location Card ---------- */}

        <div className="bg-gray-900 rounded-xl p-6 mb-8">

          <h2 className="text-2xl font-bold mb-4">
            Current Location
          </h2>

          <div className="flex gap-4 flex-wrap mb-6">

            <button
              onClick={getLocation}
              disabled={locationLoading}
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              {locationLoading
                ? "Getting Location..."
                : "Get Location"}
            </button>

            <button
              onClick={loadPlanets}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              Load Observation Data
            </button>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <p className="text-gray-400">
                Latitude
              </p>

              <p>
                {latitude ?? "Unknown"}
              </p>

            </div>

            <div>

              <p className="text-gray-400">
                Longitude
              </p>

              <p>
                {longitude ?? "Unknown"}
              </p>

            </div>

          </div>

          <p className="mt-4 text-gray-400">
            Last Updated: {lastUpdated}
          </p>

          {loading && (
            <p className="mt-4">
              Loading astronomy data...
            </p>
          )}

          {locationLoading && (
            <p className="mt-2 text-gray-400">
              Requesting location...
            </p>
          )}

        </div>

        {/* ---------- Dashboard ---------- */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {observationScore && (
            <ObservationScoreCard
              observationScore={observationScore}
            />
          )}

          {sun && (
            <SunCard
              sun={sun}
            />
          )}

          {weather && (
            <WeatherCard
              weather={weather}
            />
          )}

          {/* SkyMap will go here later */}

        </div>

        {/* ---------- Planets ---------- */}

        <div className="mt-10">

          <h2 className="text-3xl font-bold mb-6">
            Visible Planets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {planets &&
              Object.entries(planets).map(
                ([name, planet]: [string, Planet]) => (

                  <PlanetCard
                    key={name}
                    name={name}
                    planet={planet}
                  />

                )
              )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default App