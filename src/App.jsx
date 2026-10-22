import { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import { fetchWeather, WeatherApiError } from './services/weatherApi';

/**
 * Application state shapes:
 *  { status: 'idle' }
 *  { status: 'loading' }
 *  { status: 'success', data: Object }
 *  { status: 'error', code: string, message: string }
 */

function App() {
  const [appState, setAppState] = useState({ status: 'idle' });
  const [lastCity, setLastCity] = useState('');

  const handleSearch = useCallback(async (city) => {
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
  }, [appState.status]);

  return (
    <div className="app-wrapper">
      {/* Background atmospheric orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />

      <main className="app-main">
        {/* App header */}
        <header className="app-header">
          <div className="app-logo" aria-hidden="true">⛅</div>
          <h1 className="app-title">Weather App</h1>
          <p className="app-tagline">Real-time weather for any city</p>
        </header>

        {/* Search */}
        <section aria-label="City search">
          <SearchBar
            onSearch={handleSearch}
            isLoading={appState.status === 'loading'}
          />
        </section>

        {/* Dynamic result area */}
        <section
          aria-live="polite"
          aria-atomic="true"
          className="result-area"
        >
          {appState.status === 'idle' && (
            <div className="state-card idle-state">
              <div className="idle-icon" aria-hidden="true">🌍</div>
              <h2 className="state-title">Search for a city</h2>
              <p className="state-desc">
                Enter any city name above to get current weather conditions,
                temperature, humidity, wind speed, and more.
              </p>
            </div>
          )}

          {appState.status === 'loading' && (
            <div className="state-card loading-state" role="status">
              <div className="spinner" aria-hidden="true" />
              <p className="state-title">
                Fetching weather for <strong>{lastCity}</strong>…
              </p>
            </div>
          )}

          {appState.status === 'success' && (
            <WeatherCard data={appState.data} fetchedAt={appState.fetchedAt} />
          )}

          {appState.status === 'error' && (
            <div className="state-card error-state" role="alert">
              <div className="error-icon" aria-hidden="true">
                {appState.code === 'not_found' ? '🔍' :
                 appState.code === 'auth'      ? '🔑' :
                 appState.code === 'network'   ? '📡' : '⚠️'}
              </div>
              <h2 className="state-title">
                {appState.code === 'not_found' ? 'City not found' :
                 appState.code === 'auth'      ? 'Authentication error' :
                 appState.code === 'network'   ? 'Connection error' : 'Something went wrong'}
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

      <footer className="app-footer">
        <p>
          Data from{' '}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenWeatherMap
          </a>{' '}
          · Internship Task 3
        </p>
      </footer>
    </div>
  );
}

export default App;
