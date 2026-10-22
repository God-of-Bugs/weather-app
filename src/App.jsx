import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import {
  fetchWeather,
  fetchWeatherByCoords,
  WeatherApiError,
} from './services/weatherApi';

/**
 * Maps OpenWeatherMap data to a dynamic visual atmosphere theme.
 * Checks main weather condition and day/night using solar timing and icon suffix.
 *
 * @param {Object} data — OpenWeatherMap response object
 * @returns {string} theme class name
 */
function getWeatherTheme(data) {
  if (!data?.weather?.[0]) return 'theme-idle';
  const main = (data.weather[0].main || '').toLowerCase();
  const icon = data.weather[0].icon || '';

  // Determine night using solar timing if available, or icon suffix
  const isNight =
    icon.endsWith('n') ||
    (data.dt && data.sys?.sunset && data.sys?.sunrise
      ? data.dt >= data.sys.sunset || data.dt < data.sys.sunrise
      : false);

  if (main === 'clear') {
    return isNight ? 'theme-clear-night' : 'theme-clear-day';
  }
  if (main === 'clouds') {
    return isNight ? 'theme-clouds-night' : 'theme-clouds';
  }
  if (main === 'rain' || main === 'drizzle') {
    return isNight ? 'theme-rain-night' : 'theme-rain';
  }
  if (main === 'thunderstorm') {
    return 'theme-storm';
  }
  if (main === 'snow') {
    return 'theme-snow';
  }
  if (
    [
      'mist',
      'smoke',
      'haze',
      'dust',
      'fog',
      'sand',
      'ash',
      'squall',
      'tornado',
    ].includes(main)
  ) {
    return 'theme-atmosphere';
  }
  return isNight ? 'theme-clear-night' : 'theme-clear-day';
}

function App() {
  const [appState, setAppState] = useState({ status: 'idle' });
  const [lastCity, setLastCity] = useState('');

  // Standard city-name search fallback (e.g. user types "Tokyo" and hits Enter)
  const handleSearch = useCallback(
    async (city) => {
      if (appState.status === 'loading') return;
      setLastCity(city);
      setAppState({ status: 'loading' });

      try {
        const data = await fetchWeather(city);
        const fetchedAt = new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        setAppState({ status: 'success', data, fetchedAt });
      } catch (err) {
        if (err instanceof WeatherApiError) {
          setAppState({
            status: 'error',
            code: err.code,
            message: err.message,
          });
        } else {
          setAppState({
            status: 'error',
            code: 'unknown',
            message: 'An unexpected issue occurred. Please try again.',
          });
        }
      }
    },
    [appState.status]
  );

  // Exact location selection via coordinates (e.g. user selects "Patratu, Jharkhand, IN")
  const handleSelectLocation = useCallback(
    async (loc) => {
      if (appState.status === 'loading') return;
      const displayLabel = loc.state ? `${loc.name}, ${loc.state}` : loc.name;
      setLastCity(displayLabel);
      setAppState({ status: 'loading' });

      try {
        const data = await fetchWeatherByCoords(loc.lat, loc.lon, {
          name: loc.name,
          state: loc.state,
          country: loc.country,
        });
        const fetchedAt = new Date().toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        setAppState({ status: 'success', data, fetchedAt });
      } catch (err) {
        if (err instanceof WeatherApiError) {
          setAppState({
            status: 'error',
            code: err.code,
            message: err.message,
          });
        } else {
          setAppState({
            status: 'error',
            code: 'unknown',
            message: 'Unable to load weather for this location. Please try again.',
          });
        }
      }
    },
    [appState.status]
  );

  const activeTheme =
    appState.status === 'success'
      ? getWeatherTheme(appState.data)
      : 'theme-idle';

  const errorMeta = {
    not_found: {
      icon: '🔍',
      heading: 'Location Not Found',
    },
    auth: {
      icon: '🔑',
      heading: 'Service Unavailable',
    },
    network: {
      icon: '📡',
      heading: 'Connection Interrupted',
    },
    rate_limit: {
      icon: '⏳',
      heading: 'Too Many Requests',
    },
    unknown: {
      icon: '⚠️',
      heading: 'Atmospheric Glitch',
    },
    api: {
      icon: '⚠️',
      heading: 'Weather Service Error',
    },
  };

  return (
    <div className={`app-backdrop ${activeTheme}`}>
      {/* Dynamic Animated Ambient Mesh Orbs */}
      <div className="ambient-mesh-canvas" aria-hidden="true">
        <div className="ambient-orb orb-alpha" />
        <div className="ambient-orb orb-beta" />
        <div className="ambient-orb orb-gamma" />
      </div>

      <div className="app-shell">
        {/* Top Navigation Bar */}
        <header className="app-topbar">
          <div
            className="brand-mark"
            onClick={() => setAppState({ status: 'idle' })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setAppState({ status: 'idle' });
              }
            }}
            aria-label="Aether Skies home"
          >
            <span className="brand-symbol" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </span>
            <span className="brand-name">Aether</span>
            <span className="brand-badge">Skies</span>
          </div>

          {/* When displaying weather result, search bar docks in top bar */}
          {appState.status === 'success' && (
            <div className="topbar-search-slot">
              <SearchBar
                onSearch={handleSearch}
                onSelectLocation={handleSelectLocation}
                isLoading={appState.status === 'loading'}
                compact
              />
            </div>
          )}
        </header>

        {/* Main Experience View */}
        <main className="app-content-stage">
          {/* Landing / Idle State */}
          {appState.status === 'idle' && (
            <section className="landing-experience" aria-label="Welcome">
              <div className="landing-hero-copy">
                <span className="landing-kicker">Worldwide Weather Intelligence</span>
                <h1 className="landing-headline">
                  How&apos;s the <span className="gradient-highlight">sky</span> looking?
                </h1>
                <p className="landing-subtext">
                  Search anywhere to see what the weather feels like right now.
                  Explore cities, towns & villages worldwide.
                </p>
              </div>

              <div className="landing-search-wrapper">
                <SearchBar
                  onSearch={handleSearch}
                  onSelectLocation={handleSelectLocation}
                  isLoading={appState.status === 'loading'}
                  showSuggestions
                />
              </div>

              <div className="landing-feature-pills" aria-hidden="true">
                <span className="feature-pill">✦ Smart Location Autocomplete</span>
                <span className="feature-pill">✦ Exact Coordinate Weather</span>
                <span className="feature-pill">✦ Dynamic Atmosphere</span>
              </div>
            </section>
          )}

          {/* Loading Radar Pulse State */}
          {appState.status === 'loading' && (
            <section
              className="state-panel loading-radar-panel"
              role="status"
              aria-live="polite"
            >
              <div className="radar-pulse-rig" aria-hidden="true">
                <div className="radar-ring ring-1" />
                <div className="radar-ring ring-2" />
                <div className="radar-ring ring-3" />
                <div className="radar-center-beacon">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                </div>
              </div>

              <div className="loading-copy">
                <h2 className="loading-title">
                  Scanning skies over <strong>{lastCity}</strong>
                </h2>
                <p className="loading-subtitle">
                  Fetching current temperature, atmospheric pressures & winds…
                </p>
              </div>
            </section>
          )}

          {/* Success Weather State */}
          {appState.status === 'success' && (
            <section className="weather-active-stage" aria-live="polite">
              <WeatherCard
                data={appState.data}
                fetchedAt={appState.fetchedAt}
              />
            </section>
          )}

          {/* Error State */}
          {appState.status === 'error' && (
            <section
              className="state-panel error-atmosphere-panel"
              role="alert"
              aria-live="assertive"
            >
              <div className="error-icon-halo" aria-hidden="true">
                {(errorMeta[appState.code] ?? errorMeta.unknown).icon}
              </div>

              <div className="error-text-block">
                <h2 className="error-heading">
                  {(errorMeta[appState.code] ?? errorMeta.unknown).heading}
                </h2>
                <p className="error-description">{appState.message}</p>
              </div>

              <div className="error-search-retry">
                <SearchBar
                  onSearch={handleSearch}
                  onSelectLocation={handleSelectLocation}
                  isLoading={appState.status === 'loading'}
                  showSuggestions
                />
                {lastCity && (
                  <button
                    type="button"
                    className="error-retry-action"
                    onClick={() => handleSearch(lastCity)}
                  >
                    Retry &ldquo;{lastCity}&rdquo;
                  </button>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Minimal Professional Attribution Footer */}
        <footer className="app-footer-bar">
          <p className="attribution-line">
            Weather data by{' '}
            <a
              href="https://openweathermap.org"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OpenWeatherMap (opens in a new tab)"
            >
              OpenWeatherMap
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
