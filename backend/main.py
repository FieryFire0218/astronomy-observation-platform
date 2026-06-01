from fastapi import FastAPI
from skyfield.api import load, Topos
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

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
def visible_planets(lat: float, lon: float):

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