import type { Planet } from "../types/Planet";

interface SkyMapProps {
    planets: Record<string, Planet>;
}

function getPlanetPosition(
    altitude: number,
    azimuth: number
) {

    const radius = 45 * (1 - altitude / 90);

    const angle = (azimuth * Math.PI) / 180;

    const x = 50 + radius * Math.sin(angle);
    const y = 50 - radius * Math.cos(angle);

    return {
        x,
        y
    };
}

function getPlanetColor(name: string): string {

    switch (name) {

        case "Moon":
            return "bg-gray-300";

        case "Mercury":
            return "bg-gray-400";

        case "Venus":
            return "bg-yellow-200";

        case "Mars":
            return "bg-red-500";

        case "Jupiter":
            return "bg-orange-300";

        case "Saturn":
            return "bg-yellow-400";

        case "Uranus":
            return "bg-cyan-300";

        case "Neptune":
            return "bg-blue-500";

        default:
            return "bg-white";
    }
}

function getPlanetSize(name: string): string {

    switch (name) {

        case "Jupiter":
        case "Saturn":
            return "w-6 h-6";

        case "Uranus":
        case "Neptune":
            return "w-5 h-5";

        case "Moon":
        case "Venus":
        case "Mars":
            return "w-4 h-4";

        default:
            return "w-3 h-3";
    }
}

function getDirection(azimuth: number): string {

    if (azimuth >= 337.5 || azimuth < 22.5)
        return "North";

    if (azimuth < 67.5)
        return "Northeast";

    if (azimuth < 112.5)
        return "East";

    if (azimuth < 157.5)
        return "Southeast";

    if (azimuth < 202.5)
        return "South";

    if (azimuth < 247.5)
        return "Southwest";

    if (azimuth < 292.5)
        return "West";

    return "Northwest";
}

function SkyMap({ planets }: SkyMapProps) {

    return (
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg">

            <h2 className="text-2xl font-bold mb-4">
                🌌 Sky Map
            </h2>

            <div className="relative w-full max-w-[500px] aspect-square mx-auto rounded-full border-2 border-gray-500">

                <div
                    className="absolute rounded-full border border-gray-700/70"
                    style={{
                        width: "66.67%",
                        height: "66.67%",
                        left: "16.67%",
                        top: "16.67%"
                    }}
                />

                <div
                    className="absolute rounded-full border border-gray-700/50"
                    style={{
                        width: "33.33%",
                        height: "33.33%",
                        left: "33.33%",
                        top: "33.33%"
                    }}
                />

                <div
                    className="absolute w-2 h-2 bg-gray-400 rounded-full"
                    style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <span className="absolute left-3 -top-2 text-xs text-gray-500 whitespace-nowrap">
                        Zenith
                    </span>
                </div>

                <span
                    className="absolute text-xs text-gray-500"
                    style={{
                        left: "50%",
                        top: "33%",
                        transform: "translateX(-50%)"
                    }}
                >
                    60°
                </span>

                <span
                    className="absolute text-xs text-gray-500"
                    style={{
                        left: "50%",
                        top: "17%",
                        transform: "translateX(-50%)"
                    }}
                >
                    30°
                </span>

                <div className="absolute left-0 right-0 top-1/2 border-t border-gray-700" />

                <span className="absolute left-1/2 -translate-x-1/2 top-1/2 mt-2 text-xs text-gray-600">
                    Horizon
                </span>

                {/* Compass directions */}

                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-300">
                    N
                </span>

                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-300">
                    S
                </span>

                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300">
                    W
                </span>

                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300">
                    E
                </span>

                <span className="absolute top-[17%] right-[17%] text-xs text-gray-500">
                    NE
                </span>

                <span className="absolute bottom-[17%] right-[17%] text-xs text-gray-500">
                    SE
                </span>

                <span className="absolute bottom-[17%] left-[17%] text-xs text-gray-500">
                    SW
                </span>

                <span className="absolute top-[17%] left-[17%] text-xs text-gray-500">
                    NW
                </span>

                {Object.entries(planets).map(([name, planet]) => {

                    if (!planet.visible) {
                        return null;
                    }

                    const position = getPlanetPosition(
                        planet.altitude,
                        planet.azimuth
                    );

                    return (
                        <div
                            key={name}
                            className="absolute"
                            style={{
                                left: `${position.x}%`,
                                top: `${position.y}%`,
                                transform: "translate(-50%, -50%)"
                            }}
                        >

                            <div className="group relative">

                                <div
                                    className={`
                                        ${getPlanetSize(name)}
                                        ${getPlanetColor(name)}
                                        rounded-full
                                        shadow-lg
                                        cursor-pointer
                                        transition-transform
                                        hover:scale-150
                                    `}
                                />

                                <span className="
                                    absolute
                                    left-1/2
                                    -translate-x-1/2
                                    mt-2
                                    text-xs
                                    whitespace-nowrap
                                ">
                                    {name}
                                </span>

                                <div className="
                                    hidden
                                    group-hover:block
                                    absolute
                                    left-1/2
                                    -translate-x-1/2
                                    bottom-8
                                    bg-gray-950
                                    border
                                    border-gray-700
                                    rounded-lg
                                    p-3
                                    text-sm
                                    whitespace-nowrap
                                    z-50
                                    shadow-xl
                                ">

                                    <p className="font-bold text-base">
                                        {name}
                                    </p>

                                    <p>
                                        Altitude: {planet.altitude.toFixed(1)}°
                                    </p>

                                    <p>
                                        Azimuth: {planet.azimuth.toFixed(1)}°
                                    </p>

                                    <p>
                                        Direction: {getDirection(planet.azimuth)}
                                    </p>

                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default SkyMap;