import { useState } from "react"

function getDirection(azimuth: number): string {

  if (azimuth >= 337.5 || azimuth < 22.5)
    return "North"

  if (azimuth < 67.5)
    return "Northeast"

  if (azimuth < 112.5)
    return "East"

  if (azimuth < 157.5)
    return "Southeast"

  if (azimuth < 202.5)
    return "South"

  if (azimuth < 247.5)
    return "Southwest"

  if (azimuth < 292.5)
    return "West"

  return "Northwest"
}

function App() {

  const [planets, setPlanets] = useState<any>(null)
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

    const response = await fetch(
      `http://127.0.0.1:8000/visible-planets?lat=${latitude}&lon=${longitude}`
    )

    const data = await response.json()

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
            Object.entries(planets).map(([name, info]: any) => (

              <div
                key={name}
                className="bg-gray-800 p-4 rounded-xl shadow-lg"
              >

                <h3 className="text-xl font-bold">
                  {name}
                </h3>

                <p
                  className={
                    info.visible
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {info.visible ? "Visible" : "Below Horizon"}
                </p>

                <p>
                  Altitude: {info.altitude.toFixed(1)}°
                </p>

                <p>
                  Direction: {getDirection(info.azimuth)}
                </p>

              </div>

            ))
          }

        </div>

      </div>

    </div>
  )
}

export default App