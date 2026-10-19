import type { Weather } from "../types/Weather";
import type { Sun } from "../types/Sun";
import type { ObservationScore } from "../types/ObservationScore";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function getVisiblePlanets(
    latitude: number,
    longitude: number,
    observationTime?: string
) {
    const url = new URL(`${API_BASE_URL}/visible-planets`);

    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());

    if (observationTime) {
        url.searchParams.set("datetime_str", observationTime);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load planets.");
    }

    return await response.json();
}

export async function getWeather(
    latitude: number,
    longitude: number,
    observationTime?: string
): Promise<Weather> {
    const url = new URL(`${API_BASE_URL}/weather`);

    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());

    if (observationTime) {
        url.searchParams.set("datetime_str", observationTime);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load weather.");
    }

    return await response.json();
}

export async function getSun(
    latitude: number,
    longitude: number,
    observationTime?: string
): Promise<Sun> {
    const url = new URL(`${API_BASE_URL}/sun`);

    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());

    if (observationTime) {
        url.searchParams.set("datetime_str", observationTime);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load sun data.");
    }

    return await response.json();
}

export async function getObservationScore(
    latitude: number,
    longitude: number,
    observationTime?: string
): Promise<ObservationScore> {
    const url = new URL(`${API_BASE_URL}/observation-score`);

    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());

    if (observationTime) {
        url.searchParams.set("datetime_str", observationTime);
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to load observation score.");
    }

    return await response.json();
}
