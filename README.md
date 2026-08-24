# Astronomy Observation Platform

A full-stack astronomy dashboard that helps observers understand what can be seen from their location at a selected date and time.

The platform combines browser geolocation, planetary calculations, weather data, solar information, observation-quality scoring, and an interactive sky map in a responsive React dashboard.

## Features

### Location and observation time

- Uses the browser Geolocation API to obtain the observer's latitude and longitude.
- Supports a user-selected observation date and time.
- Includes quick presets for the current time, 9 PM, midnight, sunrise, and sunset.
- Handles observation sessions that cross midnight.

### Planet visibility

The FastAPI backend uses Skyfield and the bundled `backend/de421.bsp` ephemeris to calculate the apparent position of the Moon and major planets. Each object includes:

- Altitude above the horizon
- Azimuth
- Whether it is above the horizon
- Compass-direction context in the sky map

### Weather conditions

Weather data comes from the Open-Meteo API and includes:

- Temperature
- Cloud cover
- Wind speed

Weather is requested for the selected observation hour when a time is supplied.

### Solar information

Solar calculations use Astral and are displayed in the `America/New_York` timezone, including daylight-saving changes. The API returns sunrise, sunset, civil dusk, nautical dusk, and astronomical dusk.

### Observation score

The observation score is a practical 0-100 indicator based on cloud cover, wind, visible objects, and solar conditions. Daylight is identified separately so favorable weather does not produce an artificially high astronomy score during the day.

| Score | Rating |
| --- | --- |
| 90-100 | Excellent |
| 75-89 | Very Good |
| 60-74 | Good |
| 40-59 | Fair |
| 0-39 | Poor |

### Interactive sky map

The sky map places visible objects using altitude and azimuth, provides cardinal-direction context, and exposes additional object details through interactive tooltips.

## Architecture

```text
React + TypeScript + Vite frontend
				|
				| HTTP / REST
				v
FastAPI backend
	|-- Skyfield + de421.bsp: planetary positions
	|-- Astral: solar calculations
	|-- Open-Meteo: weather data
```

The frontend loads the independent astronomy, weather, solar, and scoring requests concurrently when refreshing the dashboard.

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Python 3.10+
- FastAPI
- Uvicorn
- Skyfield
- Astral
- Requests
- NumPy and related astronomy dependencies

### Data sources

- [Open-Meteo](https://open-meteo.com/) for weather forecasts
- [Skyfield](https://rhodesmill.org/skyfield/) for planetary calculations
- [Astral](https://astral.readthedocs.io/) for sunrise and sunset calculations
- Browser Geolocation API for observer coordinates

## Project structure

```text
astronomy-observation-platform/
|
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- de421.bsp
|
|-- frontend/
|   |-- src/
|       |-- components/
|       |   |-- ObservationScoreCard.tsx
|       |   |-- PlanetCard.tsx
|       |   |-- SkyMap.tsx
|       |   |-- SunCard.tsx
|       |   |-- WeatherCard.tsx
|       |-- services/astronomyApi.ts
|       |-- types/
|       |-- App.tsx
|       |-- App.css
|       |-- index.css
|   |-- package.json
|
|-- LICENSE
|-- README.md
```

## Getting started

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Git

### 1. Start the backend

From the repository root:

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

If PowerShell blocks script activation, activate the environment from Command Prompt instead:

```bat
venv\Scripts\activate
```

### 2. Start the frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is typically available at `http://localhost:5173`.

## API endpoints

All calculation endpoints accept `lat` and `lon`. Time-dependent endpoints optionally accept an ISO datetime through `datetime_str`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | API health check |
| `GET` | `/visible-planets` | Calculates Moon and planet positions and horizon visibility |
| `GET` | `/weather` | Retrieves weather for the selected hour |
| `GET` | `/sun` | Calculates the next relevant sunrise, sunset, and dusk times |
| `GET` | `/observation-score` | Generates the observation-quality score |

Example:

```text
GET http://127.0.0.1:8000/visible-planets?lat=42.81&lon=-73.94&datetime_str=2026-08-24T21:00
```

The backend enables CORS for the Vite development origin `http://localhost:5173`.

## Privacy

The application uses the browser's Geolocation API to obtain coordinates. Coordinates are sent to the local backend to calculate planet positions, solar times, weather, and the observation score. No account or persistent location storage is required.

## Development commands

Run these from `frontend/`:

```powershell
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

## Future improvements

- Deploy the frontend and backend
- Add searchable and favorite locations
- Refresh the browser location automatically
- Add constellation overlays and a star catalog
- Add light-pollution estimates
- Improve observation scoring
- Add historical weather and Progressive Web App support

## License

MIT License — see [LICENSE](LICENSE).
