import { useState } from "react"

function App() {

  const [planets, setPlanets] = useState<any>(null)

  const loadPlanets = async () => {

    const response = await fetch(
      "http://127.0.0.1:8000/visible-planets?lat=42.81&lon=-73.94"
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
          onClick={loadPlanets}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          Load Planets
        </button>

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