import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import { fetchWeather, WeatherApiError } from './services/weatherApi';

/**
 * Application state shapes:
 *  { status: 'idle' }
 *  { status: 'loading' }
 *  { status: 'success', data: Object, fetchedAt: string }
 *  { status: 'error', code: string, message: string }
 */

function App() {
  const [appState, setAppState] = useState({ status: 'idle' });
  const [lastCity, setLastCity] = useState('');

  const handleSearch = useCallback(
    async (city) => {
      if (appState.status === 'loading') return; // prevent duplicate requests
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
          setAppState({ status: 'error', code: err.code, message: err.message });
        } else {
          setAppState({
            status: 'error',
            code: 'unknown',
            message: 'An unexpected error occurred. Please try again.',
          });
        }
      }
    },
    [appState.status]
  );

  const errorMeta = {
    not_found: { icon: '🔍', heading: 'Location not found' },
    auth:      { icon: '🔑', heading: 'Service unavailable' },
    network:   { icon: '📡', heading: 'No connection' },
    rate_limit:{ icon: '⏳', heading: 'Too many requests' },
    unknown:   { icon: '⚠️', heading: 'Something went wrong' },
    api:       { icon: '⚠️', heading: 'Something went wrong' },
  };

  return (
    <div className="app-wrapper">
      {/* Atmospheric background depth */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />

      <main className="app-main">
        {/* App header */}
        <header className="app-header">
          <div className="app-logo" aria-hidden="true">⛅</div>
          <h1 className="app-title">Weather</h1>
          <p className="app-tagline">Real-time conditions for any city</p>
        </header>

        {/* Search */}
        <section aria-label="City search">
          <SearchBar
            onSearch={handleSearch}
            isLoading={appState.status === 'loading'}
          />
        </section>

        {/* Dynamic result area — aria-live for screen readers */}
        <section
          aria-live="polite"
          aria-atomic="true"
          className="result-area"
        >
          {/* Idle / welcome */}
          {appState.status === 'idle' && (
            <div className="state-card idle-state">
              <div className="idle-icon" aria-hidden="true">🌍</div>
              <h2 className="state-title">Search for a city</h2>
              <p className="state-desc">
                Enter any city name to get live temperature, humidity,
                wind, and more.
              </p>
            </div>
          )}

          {/* Loading */}
          {appState.status === 'loading' && (
            <div className="state-card loading-state" role="status">
              <div className="spinner" aria-hidden="true" />
              <p className="loading-text">
                Looking up <strong>{lastCity}</strong>…
              </p>
            </div>
          )}

          {/* Success */}
          {appState.status === 'success' && (
            <WeatherCard data={appState.data} fetchedAt={appState.fetchedAt} />
          )}

          {/* Error */}
          {appState.status === 'error' && (
            <div className="state-card error-state" role="alert">
              <div className="error-icon" aria-hidden="true">
                {(errorMeta[appState.code] ?? errorMeta.unknown).icon}
              </div>
              <h2 className="state-title">
                {(errorMeta[appState.code] ?? errorMeta.unknown).heading}
              </h2>
              <p className="state-desc">{appState.message}</p>
              <button
                className="retry-btn"
                onClick={() => handleSearch(lastCity)}
              >
                Try again
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer — required OWM attribution, styled subtly */}
      <footer className="app-footer">
        <p>
          Weather data by{' '}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OpenWeatherMap (opens in new tab)"
          >
            OpenWeatherMap
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
