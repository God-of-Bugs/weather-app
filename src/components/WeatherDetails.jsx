/**
 * WeatherDetails component.
 *
 * Renders the grid of secondary weather metric cards below the
 * main temperature display (humidity, wind, pressure, visibility, etc.)
 */

/**
 * @param {{ data: Object }} props  — raw OpenWeatherMap API response object
 */
function WeatherDetails({ data }) {
  const { main, wind, visibility, sys } = data;

  const details = [
    {
      label: 'Feels Like',
      value: `${Math.round(main.feels_like)}°C`,
      icon: '🌡️',
    },
    {
      label: 'Humidity',
      value: `${main.humidity}%`,
      icon: '💧',
    },
    {
      label: 'Wind Speed',
      value: `${wind.speed} m/s`,
      icon: '💨',
    },
    {
      label: 'Pressure',
      value: `${main.pressure} hPa`,
      icon: '⏱️',
    },
    ...(visibility !== undefined
      ? [{ label: 'Visibility', value: `${(visibility / 1000).toFixed(1)} km`, icon: '👁️' }]
      : []),
    ...(sys && sys.country
      ? []  // country shown in header; skip here
      : []),
    {
      label: 'Min Temp',
      value: `${Math.round(main.temp_min)}°C`,
      icon: '↓',
    },
    {
      label: 'Max Temp',
      value: `${Math.round(main.temp_max)}°C`,
      icon: '↑',
    },
  ];

  return (
    <dl className="details-grid">
      {details.map(({ label, value, icon }) => (
        <div key={label} className="detail-card">
          <span className="detail-icon" aria-hidden="true">{icon}</span>
          <dt className="detail-label">{label}</dt>
          <dd className="detail-value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default WeatherDetails;
