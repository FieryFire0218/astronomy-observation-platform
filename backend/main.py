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
def get_weather(lat: float, lon: float): 
    url = (
    "https://api.open-meteo.com/v1/forecast"
    f"?latitude={lat}"
    f"&longitude={lon}"
    "&current=temperature_2m,cloud_cover,wind_speed_10m"
    )

    response = requests.get(url)
    data = response.json()

    current = data["current"]

    return {
        "temperature": current["temperature_2m"],
        "cloud_cover": current["cloud_cover"],
        "wind_speed": current["wind_speed_10m"]
    }

@app.get("/sun")
def get_sun(lat: float, lon: float):

    timezone = ZoneInfo("America/New_York")

    location = LocationInfo(
        latitude=lat,
        longitude=lon
    )

    sun_times = sun(
        location.observer,
        date=date.today(),
        tzinfo=timezone
    )

    civil_dusk = dusk(
    location.observer,
    date=date.today(),
    tzinfo=timezone,
    depression=6
    )

    nautical_dusk = dusk(
        location.observer,
        date=date.today(),
        tzinfo=timezone,
        depression=12
    )

    astronomical_dusk = dusk(
        location.observer,
        date=date.today(),
        tzinfo=timezone,
        depression=18
    )

    return {
        "sunrise": sun_times["sunrise"].strftime("%I:%M %p %Z"),
        "sunset": sun_times["sunset"].strftime("%I:%M %p %Z"),
        "civil_dusk": civil_dusk.strftime("%I:%M %p %Z"),
        "nautical_dusk": nautical_dusk.strftime("%I:%M %p %Z"),
        "astronomical_dusk": astronomical_dusk.strftime("%I:%M %p %Z")
    }

@app.get("/observation-score")
def get_observation_score(
    lat: float,
    lon: float
):
    score = 100

    weather = get_weather(lat, lon)

    cloud_cover = weather["cloud_cover"]
    score -= cloud_cover * CLOUD_PENALTY

    wind = weather["wind_speed"]
    if wind > HIGH_WIND_SPEED:
        score -= 10
    if wind > VERY_HIGH_WIND_SPEED:
        score -= 15

    planets = visible_planets(lat, lon)
    visible = 0

    for planet in planets.values():
        if planet["visible"]:
            visible += 1

    score += visible * PLANET_BONUS

    score = max(0, min(100, round(score)))

    # ratings
    if score >= 90:
        rating = "Excellent"

    elif score >= 75:
        rating = "Very Good"

    elif score >= 60:
        rating = "Good"

    elif score >= 40:
        rating = "Fair"

    else:
        rating = "Poor"

    return {

        "score": score,

        "rating": rating,

        "cloud_cover": cloud_cover,

        "wind_speed": wind,

        "visible_planets": visible

    }