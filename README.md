# Weather App

Internship Task 3 — React Weather Application

## Overview

A responsive weather dashboard built with React and Vite, integrating the OpenWeatherMap API to display real-time weather data.

> **Status:** Project initialized. Weather functionality will be implemented in the next development phase.

## Tech Stack

- **React** — UI library
- **Vite** — Build tool and development server
- **JavaScript / JSX** — Language
- **OpenWeatherMap API** — Weather data _(integration planned)_

## Planned Features

- City search
- Current weather display
- Responsive weather dashboard

## Environment Variables

API credentials are stored through environment variables and are **never committed** to the repository.

Copy `.env.example` to `.env.local` and fill in your key:

```bash
cp .env.example .env.local
```

`.env.local` is listed in `.gitignore` and will not be tracked.

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Security

- `.env`, `.env.local`, and `.env.*.local` are excluded from version control via `.gitignore`
- No real API keys exist in this repository
- See `.env.example` for the required variable names (placeholder values only)
