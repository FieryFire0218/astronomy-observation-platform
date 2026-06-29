import type { Planet } from "../types/Planet";

interface PlanetCardProps {
  name: string;
  planet: Planet;
}

function getDirection(azimuth: number): string {
  if (azimuth >= 337.5 || azimuth < 22.5) return "North";
  if (azimuth < 67.5) return "Northeast";
  if (azimuth < 112.5) return "East";
  if (azimuth < 157.5) return "Southeast";
  if (azimuth < 202.5) return "South";
  if (azimuth < 247.5) return "Southwest";
  if (azimuth < 292.5) return "West";
  return "Northwest";
}

function PlanetCard({ name, planet }: PlanetCardProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold">{name}</h3>

      <p className={planet.visible ? "text-green-400" : "text-red-400"}>
        {planet.visible ? "Visible" : "Below Horizon"}
      </p>

      <p>Altitude: {planet.altitude.toFixed(1)}°</p>

      <p>Direction: {getDirection(planet.azimuth)}</p>
    </div>
  );
}

export default PlanetCard;
