import pytest
from fastapi.testclient import TestClient

import main


client = TestClient(main.app)

LAT = 40.5
LON = -74.45

# Fixed times prevent test results from changing.
NIGHT_TIME = "2026-10-19T23:00:00"
DAY_TIME = "2026-10-19T12:00:00"


@pytest.fixture
def mock_weather(monkeypatch):
    def set_weather(cloud_cover, wind_speed):
        def fake_get_weather(lat, lon, datetime_str=None):
            return {
                "temperature": 12,
                "cloud_cover": cloud_cover,
                "wind_speed": wind_speed,
            }

        monkeypatch.setattr(
            main,
            "get_weather",
            fake_get_weather,
        )

    return set_weather


def get_score(observation_time):
    response = client.get(
        "/observation-score",
        params={
            "lat": LAT,
            "lon": LON,
            "datetime_str": observation_time,
        },
    )

    assert response.status_code == 200

    return response.json()


def test_score_is_between_zero_and_100(mock_weather):
    mock_weather(
        cloud_cover=50,
        wind_speed=10,
    )

    data = get_score(NIGHT_TIME)

    assert 0 <= data["score"] <= 100


def test_clouds_reduce_score(mock_weather):
    # Test clear skies.
    mock_weather(
        cloud_cover=0,
        wind_speed=3,
    )

    clear = get_score(NIGHT_TIME)

    # Test completely cloudy skies.
    mock_weather(
        cloud_cover=100,
        wind_speed=3,
    )

    cloudy = get_score(NIGHT_TIME)

    assert clear["score"] > cloudy["score"]


def test_high_wind_reduces_score(mock_weather):
    # Test low wind.
    mock_weather(
        cloud_cover=100,
        wind_speed=3,
    )

    calm = get_score(NIGHT_TIME)

    # Test very high wind.
    mock_weather(
        cloud_cover=100,
        wind_speed=35,
    )

    windy = get_score(NIGHT_TIME)

    assert calm["score"] > windy["score"]


def test_daylight_caps_score(mock_weather):
    mock_weather(
        cloud_cover=0,
        wind_speed=0,
    )

    data = get_score(DAY_TIME)

    assert data["sun_altitude"] > 0
    assert data["score"] <= 20
    assert data["rating"] == "Daylight"


def test_nighttime_is_not_daylight(mock_weather):
    mock_weather(
        cloud_cover=0,
        wind_speed=0,
    )

    data = get_score(NIGHT_TIME)

    assert data["sun_altitude"] < 0
    assert data["rating"] != "Daylight"


def test_score_response_contains_expected_fields(mock_weather):
    mock_weather(
        cloud_cover=25,
        wind_speed=7,
    )

    data = get_score(NIGHT_TIME)

    expected_fields = {
        "score",
        "rating",
        "cloud_cover",
        "wind_speed",
        "visible_planets",
        "sun_altitude",
    }

    assert set(data.keys()) == expected_fields

    assert 0 <= data["visible_planets"] <= 8
    assert -90 <= data["sun_altitude"] <= 90
