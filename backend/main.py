from fastapi import FastAPI
from skyfield.api import load, Topos
from datetime import datetime
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
import requests
from astral import LocationInfo
from astral.sun import sun, dawn, dusk
from astral import SunDirection
from zoneinfo import ZoneInfo

CLOUD_PENALTY = 0.6
HIGH_WIND_SPEED = 15
VERY_HIGH_WIND_SPEED = 30
PLANET_BONUS = 2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load planetary data
planets = load('de421.bsp')

earth = planets['earth']
planet_objects = {
    "Moon": planets["moon"],
    "Mercury": planets["mercury"],
    "Venus": planets["venus"],
    "Mars": planets["mars"],
    "Jupiter": planets["jupiter barycenter"],
    "Saturn": planets["saturn barycenter"],
    "Uranus": planets["uranus barycenter"],
    "Neptune": planets["neptune barycenter"]
}

# Timescale object
ts = load.timescale()


@app.get("/")
def root():
    return {"message": "Astronomy API running"}


@app.get("/visible-planets")
def visible_planets(lat: float, lon: float, datetime_str: str | None = None):

    if datetime_str:
        dt = datetime.fromisoformat(datetime_str)

        if dt.tzinfo is None:
            dt = dt.replace(
                tzinfo=ZoneInfo("America/New_York")
            )

        t = ts.from_datetime(dt)

    else:
        t = ts.now()

    observer = earth + Topos(
        latitude_degrees=lat,
        longitude_degrees=lon
    )

    results = {}

    for planet_name, planet in planet_objects.items():

        astrometric = observer.at(t).observe(planet)
        apparent = astrometric.apparent()

        alt, az, distance = apparent.altaz()

        altitude = float(alt.degrees)
        azimuth = float(az.degrees)

        visible = bool(altitude > 0)

        results[planet_name] = {
            "visible": visible,
            "altitude": round(altitude, 2),
            "azimuth": round(azimuth, 2)
        }

    return results

@app.get("/weather")
def get_weather(
    lat: float,
    lon: float,
    datetime_str: str | None = None
):
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}"
        f"&longitude={lon}"
        "&hourly=temperature_2m,cloud_cover,wind_speed_10m"
        "&timezone=America/New_York"
        "&forecast_days=16"
    )

    response = requests.get(url)
    response.raise_for_status()

    data = response.json()

    hourly = data["hourly"]

    # If no observation time is supplied, use the current hour
    if datetime_str:
        selected_time = datetime.fromisoformat(datetime_str)

        # datetime-local produces a naive datetime, so interpret it as Eastern time
        if selected_time.tzinfo is None:
            selected_time = selected_time.replace(
                tzinfo=ZoneInfo("America/New_York")
            )

        # Open-Meteo gives local timestamps such as "2026-08-24T22:00"
        target_time = selected_time.strftime("%Y-%m-%dT%H:00")
    else:
        now = datetime.now(ZoneInfo("America/New_York"))
        target_time = now.strftime("%Y-%m-%dT%H:00")

    # Find the requested hour
    try:
        index = hourly["time"].index(target_time)
    except ValueError:
        raise ValueError(
            f"Weather data is not available for {target_time}"
        )

    return {
        "temperature": hourly["temperature_2m"][index],
        "cloud_cover": hourly["cloud_cover"][index],
        "wind_speed": hourly["wind_speed_10m"][index]
    }

@app.get("/sun")
def get_sun(
    lat: float,
    lon: float,
    datetime_str: str | None = None
):

    timezone = ZoneInfo("America/New_York")

    location = LocationInfo(
        latitude=lat,
        longitude=lon
    )

    if datetime_str:

        observation_datetime = datetime.fromisoformat(
            datetime_str
        )

        if observation_datetime.tzinfo is None:
            observation_datetime = observation_datetime.replace(
                tzinfo=timezone
            )

        observation_date = observation_datetime.date()

    else:

        observation_datetime = datetime.now(timezone)
        observation_date = observation_datetime.date()


    sun_times = sun(
        location.observer,
        date=observation_date,
        tzinfo=timezone
    )


    sunrise = sun_times["sunrise"]
    sunset = sun_times["sunset"]


    if sunrise <= observation_datetime:

        next_date = observation_date.fromordinal(
            observation_date.toordinal() + 1
        )

        next_sun_times = sun(
            location.observer,
            date=next_date,
            tzinfo=timezone
        )

        sunrise = next_sun_times["sunrise"]


    if sunset <= observation_datetime:

        next_date = observation_date.fromordinal(
            observation_date.toordinal() + 1
        )

        next_sun_times = sun(
            location.observer,
            date=next_date,
            tzinfo=timezone
        )

        sunset = next_sun_times["sunset"]

    civil_dusk = dusk(
        location.observer,
        date=observation_date,
        tzinfo=timezone,
        depression=6
    )

    nautical_dusk = dusk(
        location.observer,
        date=observation_date,
        tzinfo=timezone,
        depression=12
    )

    astronomical_dusk = dusk(
        location.observer,
        date=observation_date,
        tzinfo=timezone,
        depression=18
    )

    return {
        "sunrise": sunrise.strftime("%I:%M %p %Z"),
        "sunrise_datetime": sunrise.isoformat(),

        "sunset": sunset.strftime("%I:%M %p %Z"),
        "sunset_datetime": sunset.isoformat(),

        "civil_dusk": civil_dusk.strftime("%I:%M %p %Z"),
        "nautical_dusk": nautical_dusk.strftime("%I:%M %p %Z"),
        "astronomical_dusk": astronomical_dusk.strftime("%I:%M %p %Z")
    }

@app.get("/observation-score")
def get_observation_score(
    lat: float,
    lon: float,
    datetime_str: str | None = None
):
    if datetime_str:
        observation_datetime = datetime.fromisoformat(datetime_str)

        if observation_datetime.tzinfo is None:
            observation_datetime = observation_datetime.replace(
                tzinfo=ZoneInfo("America/New_York")
            )

        # Convert to Skyfield time
        t = ts.from_datetime(observation_datetime)

    else:
        observation_datetime = datetime.now(
            ZoneInfo("America/New_York")
        )

        t = ts.from_datetime(observation_datetime)


    weather = get_weather(
        lat,
        lon,
        datetime_str
    )

    cloud_cover = float(weather["cloud_cover"])
    wind_speed = float(weather["wind_speed"])


    observer = earth + Topos(
        latitude_degrees=lat,
        longitude_degrees=lon
    )

    visible_planet_count = 0

    for planet_name, planet in planet_objects.items():

        astrometric = observer.at(t).observe(planet)
        apparent = astrometric.apparent()

        alt, az, distance = apparent.altaz()

        altitude = float(alt.degrees)

        if altitude > 0:
            visible_planet_count += 1


    sun_position = (
        observer
        .at(t)
        .observe(planets["sun"])
        .apparent()
    )

    sun_altitude, _, _ = sun_position.altaz()

    sun_altitude = float(sun_altitude.degrees)


    score = 100

    # Cloud cover
    score -= cloud_cover * 0.5

    # Wind
    if wind_speed > 20:
        score -= 20
    elif wind_speed > 10:
        score -= 10
    elif wind_speed > 5:
        score -= 5

    # Visible planets
    score += visible_planet_count * 5

    # Keep score within 0-100
    score = max(0, min(100, score))



    if sun_altitude > 0:

        # Astronomy observing conditions are poor
        # during daylight regardless of weather.
        score = min(score, 20)

        rating = "Daylight"

    elif score >= 90:

        rating = "Excellent"

    elif score >= 75:

        rating = "Very Good"

    elif score >= 60:

        rating = "Good"

    elif score >= 40:

        rating = "Fair"

    else:

        rating = "Poor"


    # Return results
    return {
        "score": round(score),
        "rating": rating,
        "cloud_cover": cloud_cover,
        "wind_speed": wind_speed,
        "visible_planets": visible_planet_count,
        "sun_altitude": round(sun_altitude, 2)
    }