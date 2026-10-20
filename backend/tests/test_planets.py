from fastapi.testclient import TestClient

from main import app


client = TestClient(app)

TEST_PARAMS = {
    "lat": 40.5,
    "lon": -74.45,
    "datetime_str": "2026-10-19T21:00:00",
}


def test_planet_data_structure():
    response = client.get(
        "/visible-planets",
        params=TEST_PARAMS,
    )

    assert response.status_code == 200

    data = response.json()

    expected_objects = {
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
    }

    assert set(data.keys()) == expected_objects

    for planet in data.values():
        assert isinstance(planet["visible"], bool)
        assert isinstance(planet["altitude"], (int, float))
        assert isinstance(planet["azimuth"], (int, float))


def test_planet_coordinates_are_valid():
    response = client.get(
        "/visible-planets",
        params=TEST_PARAMS,
    )

    assert response.status_code == 200

    data = response.json()

    for name, planet in data.items():
        altitude = planet["altitude"]
        azimuth = planet["azimuth"]

        assert -90 <= altitude <= 90, name
        assert 0 <= azimuth <= 360, name


def test_planet_visibility_matches_altitude():
    response = client.get(
        "/visible-planets",
        params=TEST_PARAMS,
    )

    assert response.status_code == 200

    data = response.json()

    for name, planet in data.items():
        altitude = planet["altitude"]
        visible = planet["visible"]

        # Use the API's rounded altitude for this check,
        # allowing a small tolerance near the horizon.
        if altitude > 0.01:
            assert visible is True, name

        elif altitude < -0.01:
            assert visible is False, name


def test_planet_positions_are_repeatable():
    first = client.get(
        "/visible-planets",
        params=TEST_PARAMS,
    )

    second = client.get(
        "/visible-planets",
        params=TEST_PARAMS,
    )

    assert first.status_code == 200
    assert second.status_code == 200

    assert first.json() == second.json()
