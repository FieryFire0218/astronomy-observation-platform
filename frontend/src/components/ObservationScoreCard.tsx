import type { ObservationScore } from "../types/ObservationScore";

interface ObservationScoreCardProps {
    observationScore: ObservationScore;
}

function getRatingColor(score: number): string {

    if (score >= 90)
        return "text-green-400";

    if (score >= 75)
        return "text-lime-400";

    if (score >= 60)
        return "text-yellow-400";

    if (score >= 40)
        return "text-orange-400";

    return "text-red-400";
}

function ObservationScoreCard({
    observationScore
}: ObservationScoreCardProps) {

    return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mt-6">

        <h2 className="text-2xl font-bold mb-4">
            ⭐ Observation Score
        </h2>

        <p
            className={`text-4xl font-bold ${getRatingColor(observationScore.score)}`}
        >
            {observationScore.score}/100
        </p>

        <p className="text-xl mt-2">
            {observationScore.rating}
        </p>

        <hr className="my-4 border-gray-600"/>

        <p>
            ☁ Cloud Cover: {observationScore.cloud_cover}%
        </p>

        <p>
            💨 Wind Speed: {observationScore.wind_speed} km/h
        </p>

        <p>
            🪐 Visible Planets: {observationScore.visible_planets}
        </p>

    </div>
    
    );

}

export default ObservationScoreCard;