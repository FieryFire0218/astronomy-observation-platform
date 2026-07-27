import type { Weather } from "../types/Weather";
import type { Sun } from "../types/Sun";
import type { ObservationScore } from "../types/ObservationScore";

export async function getVisiblePlanets(
    latitude: number,
    longitude: number
) {

    const response = await fetch(
        `http://127.0.0.1:8000/visible-planets?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
        throw new Error("Failed to load planets.");
    }

    return await response.json();
}

export async function getWeather(
    latitude: number,
    longitude: number
): Promise<Weather> {

    const response = await fetch(
        `http://127.0.0.1:8000/weather?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
        throw new Error("Failed to load weather.");
    }

    return await response.json();
}

export async function getSun(
    latitude: number,
    longitude: number
): Promise<Sun> {

    const response = await fetch(
        `http://127.0.0.1:8000/sun?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
        throw new Error("Failed to load sun data.");
    }

    return await response.json();
}

export async function getObservationScore(
    latitude: number,
    longitude: number
): Promise<ObservationScore> {

    const response = await fetch(
        `http://127.0.0.1:8000/observation-score?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
        throw new Error("Failed to load observation score.");
    }

    return await response.json();
}