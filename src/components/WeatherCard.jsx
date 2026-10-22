import WeatherDetails from './WeatherDetails';

/**
 * WeatherCard component.
 *
 * Renders an editorial, experiential weather hero with prominent temperature,
 * dynamic condition overview, place disambiguation (city, state, country),
 * and floating metric tiles.
 *
 * @param {{ data: Object, fetchedAt?: string }} props
 *   data      — OpenWeatherMap response object (may include customLocation from geocoder)
 *   fetchedAt — formatted date string computed at fetch time
 */
function WeatherCard({ data, fetchedAt }) {
  const { name, sys, weather, main, customLocation } = data;
  const condition = weather?.[0] || {};

  // High-res icon from OpenWeatherMap
  const iconUrl = condition.icon
    ? `https://openweathermap.org/img/wn/${condition.icon}@4x.png`
    : '';

  // Determine display name and region (from geocoder if available, or fallback to API payload)
  const displayName = customLocation?.name || name;
  const displayState = customLocation?.state || '';
  const displayCountry = customLocation?.country || sys?.country || '';

  return (
    <article className="weather-experience-card" aria-label={`Weather in ${displayName}`}>
      {/* Top Location Bar */}
      <header className="weather-location-bar">
        <div className="location-title-wrap">
          <span className="location-pin-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <h2 className="location-city-name">{displayName}</h2>
          {displayState && (
            <span className="location-state-tag">{displayState}</span>
          )}
          {displayCountry && (
            <span className="location-country-tag">{displayCountry}</span>
          )}
        </div>

        <div className="location-meta-tags">
          <span className="live-status-tag" aria-label="Real-time data">
            <span className="live-pulse-dot" aria-hidden="true" />
            Live
          </span>
          {fetchedAt && <span className="date-display-tag">{fetchedAt}</span>}
        </div>
      </header>

      {/* Hero Temperature & Condition Showcase */}
      <div className="weather-hero-stage">
        <div className="hero-content-col">
          <div className="hero-temp-lockup">
            <span
              className="hero-temp-number"
              aria-label={`Current temperature: ${Math.round(main.temp)} degrees Celsius`}
            >
              {Math.round(main.temp)}
            </span>
            <span className="hero-temp-unit">°C</span>
          </div>

          <div className="hero-condition-text">
            <p className="condition-headline">{condition.main}</p>
            <p className="condition-caption">{condition.description}</p>
          </div>

          <div className="hero-pill-cluster">
            <span className="hero-stat-pill">
              Feels like <strong>{Math.round(main.feels_like)}°C</strong>
            </span>
            <span className="hero-stat-pill">
              H: <strong>{Math.round(main.temp_max)}°</strong> · L:{' '}
              <strong>{Math.round(main.temp_min)}°</strong>
            </span>
          </div>
        </div>

        <div className="hero-visual-col" aria-hidden="true">
          <div className="weather-orb-halo">
            <div className="orb-ambient-glow" />
            {iconUrl && (
              <img
                src={iconUrl}
                alt={condition.description || 'Weather condition icon'}
                className="hero-artwork-img"
                width="140"
                height="140"
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Metrics Showcase */}
      <WeatherDetails data={data} />
    </article>
  );
}

export default WeatherCard;
