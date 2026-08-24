import type { Weather } from "../types/Weather";

interface WeatherCardProps {
    weather: Weather;
}

function WeatherCard({ weather }: WeatherCardProps) {

    return (
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg mt-6">

            <h2 className="text-2xl font-bold mb-4">
                🌤 Weather Conditions
            </h2>

            <p>
                🌡 Temperature: {weather.temperature}°C
            </p>

            <p>
                ☁ Cloud Cover: {weather.cloud_cover}%
            </p>

            <p>
                💨 Wind Speed: {weather.wind_speed} km/h
            </p>

        </div>
    )

}

export default WeatherCard;