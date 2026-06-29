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