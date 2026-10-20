import pytest
from fastapi.testclient import TestClient

import main


client = TestClient(main.app)


def test_health_check():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Astronomy API running"
    }


@pytest.mark.parametrize(
    "endpoint",
    [
        "/visible-planets",
        "/weather",
        "/sun",
        "/observation-score",
    ],
)
def test_invalid_latitude(endpoint):
    response = client.get(
        endpoint,
        params={
            "lat": "invalid",
            "lon": -74.45,
        },
    )

    assert response.status_code == 422


def test_missing_coordinates():
    response = client.get("/visible-planets")

    assert response.status_code == 422


def test_weather_uses_selected_hour(monkeypatch):
    # Simulate a successful response from Open-Meteo.
    class FakeResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "hourly": {
                    "time": [
                        "2026-10-19T20:00",
                        "2026-10-19T21:00",
                        "2026-10-19T22:00",
                    ],
                    "temperature_2m": [14, 12, 10],
                    "cloud_cover": [10, 25, 80],
                    "wind_speed_10m": [4, 7, 12],
                }
            }

    def fake_get(url):
        assert "api.open-meteo.com" in url
        return FakeResponse()

    # Prevent an actual internet request.
    monkeypatch.setattr(main.requests, "get", fake_get)

    response = client.get(
        "/weather",
        params={
            "lat": 40.5,
            "lon": -74.45,
            "datetime_str": "2026-10-19T21:30:00",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["temperature"] == 12
    assert data["cloud_cover"] == 25
    assert data["wind_speed"] == 7
