const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather for a given city name.
 * Units: metric (°C, m/s).
 * API key is read from the Vite environment — never hardcoded.
 *
 * @param {string} city
 * @returns {Promise<Object>} OpenWeatherMap current-weather response
 * @throws {WeatherApiError}
 */
export async function fetchWeather(city) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const url = new URL(`${BASE_URL}/weather`);
  url.searchParams.set('q', city.trim());
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');

  let response;
  try {
    response = await fetch(url.toString());
  } catch {
    // Network-level failure (offline, DNS, CORS, etc.)
    throw new WeatherApiError('network', 'Unable to reach the weather service. Check your internet connection.');
  }

  if (response.ok) {
    const data = await response.json();
    return data;
  }

  // HTTP error — decode meaningful status codes
  if (response.status === 404) {
    throw new WeatherApiError('not_found', 'City not found. Try checking the spelling or using a nearby larger city.');
  }
  if (response.status === 401) {
    throw new WeatherApiError('auth', 'Weather service authentication failed. The API key may be inactive or invalid.');
  }
  if (response.status === 429) {
    throw new WeatherApiError('rate_limit', 'Too many requests. Please wait a moment and try again.');
  }

  throw new WeatherApiError('api', `Weather service returned an unexpected error (HTTP ${response.status}).`);
}

/**
 * Typed error class for weather API failures.
 */
export class WeatherApiError extends Error {
  /**
   * @param {'network'|'not_found'|'auth'|'rate_limit'|'api'} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}
