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

        {observationScore && (
            <ObservationScoreCard
                observationScore={observationScore}
            />
        )}

        {weather && (
          <WeatherCard weather={weather} />
        )}

        {sun && (
            <SunCard sun={sun} />
        )}

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