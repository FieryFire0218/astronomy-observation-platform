from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)

TIMEZONE = ZoneInfo("America/New_York")

LAT = 40.5
LON = -74.45


def get_sun_data(observation_time):
    response = client.get(
        "/sun",
        params={
            "lat": LAT,
            "lon": LON,
            "datetime_str": observation_time,
        },
    )

    assert response.status_code == 200

    return response.json()


def test_sunrise_and_sunset_are_after_observation():
    observation = datetime(
        2026, 10, 19, 12, 0,
        tzinfo=TIMEZONE,
    )

    data = get_sun_data(
        "2026-10-19T12:00:00"
    )

    sunrise = datetime.fromisoformat(
        data["sunrise_datetime"]
    )

    sunset = datetime.fromisoformat(
        data["sunset_datetime"]
    )

    # The API promises the next sunrise and sunset.
    assert sunrise > observation
    assert sunset > observation


def test_midnight_rollover():
    observation = datetime(
        2026, 10, 19, 23, 0,
        tzinfo=TIMEZONE,
    )

    data = get_sun_data(
        "2026-10-19T23:00:00"
    )

    sunrise = datetime.fromisoformat(
        data["sunrise_datetime"]
    )

    sunset = datetime.fromisoformat(
        data["sunset_datetime"]
    )

    next_day = observation.date() + timedelta(days=1)

    assert sunrise.date() == next_day
    assert sunset.date() == next_day

    assert sunrise > observation
    assert sunset > observation


def test_eastern_daylight_saving_time():
    winter = get_sun_data(
        "2026-01-15T12:00:00"
    )

    summer = get_sun_data(
        "2026-07-15T12:00:00"
    )

    winter_sunrise = datetime.fromisoformat(
        winter["sunrise_datetime"]
    )

    summer_sunrise = datetime.fromisoformat(
        summer["sunrise_datetime"]
    )

    # January uses EST (UTC-5).
    assert winter_sunrise.utcoffset() == timedelta(hours=-5)

    # July uses EDT (UTC-4).
    assert summer_sunrise.utcoffset() == timedelta(hours=-4)


def test_dusk_values_are_returned():
    data = get_sun_data(
        "2026-10-19T12:00:00"
    )

    for key in [
        "civil_dusk",
        "nautical_dusk",
        "astronomical_dusk",
    ]:
        assert key in data
        assert isinstance(data[key], str)
        assert len(data[key]) > 0
