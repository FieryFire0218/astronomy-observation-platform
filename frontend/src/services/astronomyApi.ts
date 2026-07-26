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

import type { Weather } from "../types/Weather";

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