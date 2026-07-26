import type { Sun } from "../types/Sun";

interface SunCardProps {
    sun: Sun;
}

function SunCard({ sun }: SunCardProps) {

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg mt-6">

            <h2 className="text-2xl font-bold mb-4">
                ☀️ Sun Information
            </h2>

            <p>
                🌅 Sunrise: {sun.sunrise}
            </p>

            <p>
                🌇 Sunset: {sun.sunset}
            </p>

            <p>
                🌆 Civil Twilight: {sun.civil_dusk}
            </p>

            <p>
                🌌 Nautical Twilight: {sun.nautical_dusk}
            </p>

            <p>
                ✨ Astronomical Twilight: {sun.astronomical_dusk}
            </p>

        </div>
    );

}

export default SunCard;