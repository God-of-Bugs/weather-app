# Weather App

Internship Task 3 — React Weather Application

A clean, responsive weather dashboard built with React and Vite, integrating the OpenWeatherMap API to display real-time current weather conditions for any city worldwide.

---

## Features

- **City search** — search by name, submit with Enter or button click
- **Real-time weather data** from OpenWeatherMap API
- **Current temperature** in °C with feels-like, min, and max
- **Weather condition** with icon, description, humidity, wind speed, pressure, and visibility
- **Proper application states** — idle, loading, success, city-not-found, auth error, network error
- **Responsive design** — works from 320 px mobile through large desktop
- **Accessible** — semantic HTML, ARIA live regions, keyboard-navigable, focus indicators

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **JavaScript / JSX** | Language |
| **CSS** | Styling — custom properties, responsive grid |
| **OpenWeatherMap API** | Current weather data |

---

## Project Structure

```
src/
├── components/
│   ├── SearchBar.jsx      — city search form
│   ├── WeatherCard.jsx    — main weather result display
│   └── WeatherDetails.jsx — secondary metric cards grid
├── services/
│   └── weatherApi.js      — API fetch logic, error handling
├── App.jsx                — application shell + state management
├── App.css                — all styles
└── main.jsx               — React entry point
```

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/God-of-Bugs/weather-app.git
cd weather-app
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and add your OpenWeatherMap API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

Get a free API key at [openweathermap.org](https://openweathermap.org/api).

> **Note:** `.env.local` is listed in `.gitignore` and is never committed.
> The `VITE_` prefix causes Vite to embed the variable in the client bundle at build time — do not use this key for privileged server-side operations.

### 3. Run

```bash
# Development server
npm run dev

# Production build
npm run build

# Lint
npm run lint
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key (required) |

---

## API

Uses the [OpenWeatherMap Current Weather](https://openweathermap.org/current) endpoint:

```
GET https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={key}
```
