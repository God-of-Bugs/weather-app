import WeatherDetails from './WeatherDetails';

/**
 * WeatherCard component.
 *
 * Renders the full weather result panel:
 * city/country, date, icon, temperature, condition, and detail grid.
 *
 * @param {{ data: Object, fetchedAt: string }} props
 *   data      — raw OpenWeatherMap API response object
 *   fetchedAt — pre-formatted date string (computed outside render)
 */
function WeatherCard({ data, fetchedAt }) {
  const { name, sys, weather, main } = data;
  const condition = weather[0];

  const iconUrl = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;

  return (
    <article className="weather-card" aria-label={`Weather for ${name}`}>
      <div className="card-inner">
        {/* City header */}
        <header className="card-header">
          <div className="city-info">
            <h2 className="city-name">{name}</h2>
            {sys?.country && (
              <span className="country-badge">{sys.country}</span>
            )}
          </div>
          {fetchedAt && (
            <p className="weather-date">{fetchedAt}</p>
          )}
        </header>

        {/* Main temperature + icon */}
        <div className="card-hero">
          <div className="temp-block">
            <span
              className="temperature"
              aria-label={`Temperature: ${Math.round(main.temp)} degrees Celsius`}
            >
              {Math.round(main.temp)}
              <sup className="temp-unit">°C</sup>
            </span>
            <p className="condition-description">{condition.description}</p>
          </div>
          <div className="icon-block">
            <img
              src={iconUrl}
              alt={condition.description}
              className="weather-icon"
              width="88"
              height="88"
            />
            <p className="condition-main">{condition.main}</p>
          </div>
        </div>

        {/* Detail metrics grid */}
        <WeatherDetails data={data} />
      </div>
    </article>
  );
}

export default WeatherCard;
