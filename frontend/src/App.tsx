import { useState } from "react"

function App() {

  const [planets, setPlanets] = useState<any>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  const getLocation = () => {

  navigator.geolocation.getCurrentPosition(

    (position) => {

      setLatitude(position.coords.latitude)

      setLongitude(position.coords.longitude)

      console.log(position.coords.latitude)
      console.log(position.coords.longitude)
    },

    (error) => {
      console.error(error)
    }
  )
}

  const loadPlanets = async () => {

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
          className="bg-green-500 px-4 py-2 rounded-lg mr-4"
        >
          Get Location
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

        <div className="mt-6 space-y-4">

          {planets &&
            Object.entries(planets).map(([name, info]: any) => (

              <div
                key={name}
                className="bg-gray-800 p-4 rounded-lg"
              >

                <h3 className="text-xl font-bold">
                  {name}
                </h3>

                <p>
                  Visible: {info.visible ? "Yes" : "No"}
                </p>

                <p>
                  Altitude: {info.altitude}°
                </p>

                <p>
                  Azimuth: {info.azimuth}°
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