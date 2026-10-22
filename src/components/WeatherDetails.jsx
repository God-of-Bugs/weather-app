/**
 * WeatherDetails component.
 *
 * Renders floating translucent atmospheric tiles for secondary weather metrics
 * (Feels like, Humidity, Wind speed, Air pressure, Visibility, Day range).
 *
 * @param {{ data: Object }} props — OpenWeatherMap response object
 */
function WeatherDetails({ data }) {
  const { main, wind, visibility } = data;

  const humidityDesc =
    main.humidity > 70
      ? 'High moisture'
      : main.humidity < 35
      ? 'Dry air'
      : 'Comfortable';

  const windDesc =
    wind.speed > 8
      ? 'Breezy & active'
      : wind.speed > 4
      ? 'Moderate breeze'
      : 'Calm air';

  const details = [
    {
      id: 'feels_like',
      label: 'Feels Like',
      value: `${Math.round(main.feels_like)}°C`,
      sub:
        Math.round(main.feels_like) > Math.round(main.temp)
          ? 'Warmer than actual'
          : Math.round(main.feels_like) < Math.round(main.temp)
          ? 'Cooler than actual'
          : 'Matches actual temp',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      ),
    },
    {
      id: 'humidity',
      label: 'Humidity',
      value: `${main.humidity}%`,
      sub: humidityDesc,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      ),
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: `${wind.speed} m/s`,
      sub: windDesc,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      ),
    },
    {
      id: 'pressure',
      label: 'Air Pressure',
      value: `${main.pressure} hPa`,
      sub: main.pressure >= 1013 ? 'High pressure system' : 'Low pressure system',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 12a4 4 0 1 1-8 0" />
          <line x1="12" y1="8" x2="12" y2="12" />
        </svg>
      ),
    },
    ...(visibility !== undefined
      ? [
          {
            id: 'visibility',
            label: 'Visibility',
            value: `${(visibility / 1000).toFixed(1)} km`,
            sub: visibility >= 10000 ? 'Clear line of sight' : 'Reduced sight',
            icon: (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ),
          },
        ]
      : []),
    {
      id: 'range',
      label: 'Day Range',
      value: `${Math.round(main.temp_min)}° / ${Math.round(main.temp_max)}°`,
      sub: 'Low & high expected',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 10 12 5 17 10" />
          <polyline points="7 14 12 19 17 14" />
        </svg>
      ),
    },
  ];

  return (
    <section className="metrics-showcase" aria-label="Detailed atmospheric metrics">
      <div className="metrics-showcase-header">
        <h3 className="metrics-showcase-title">Atmospheric Metrics</h3>
        <span className="metrics-status-pill">Metric units (°C)</span>
      </div>

      <div className="metrics-floating-grid">
        {details.map((item) => (
          <div key={item.id} className="metric-glass-tile">
            <div className="metric-tile-top">
              <span className="metric-tile-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="metric-tile-label">{item.label}</span>
            </div>
            <div className="metric-tile-bottom">
              <span className="metric-tile-value">{item.value}</span>
              <span className="metric-tile-sub">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeatherDetails;
