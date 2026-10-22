const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather for a given city name.
 * Units: metric (°C, m/s).
 * API key is read from the Vite environment — never hardcoded.
 *
 * Handles both HTTP-level errors (status codes) and the OWM-internal
 * `cod` field, which can be a string ("404") or number (200) depending
 * on the API version/response path.
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
    throw new WeatherApiError(
      'network',
      'Unable to reach the weather service. Check your internet connection and try again.'
    );
  }

  // Parse JSON regardless of status so we can read OWM error bodies
  let data;
  try {
    data = await response.json();
  } catch {
    throw new WeatherApiError(
      'api',
      `The weather service returned an unreadable response (HTTP ${response.status}).`
    );
  }

  // Success path — verify the internal cod field as a belt-and-suspenders check
  if (response.ok) {
    // Some OWM edge cases return HTTP 200 with an error cod in the body
    const cod = String(data.cod);
    if (cod === '404') {
      throw new WeatherApiError(
        'not_found',
        `We couldn't find "${city}". Check the spelling or try a nearby larger city.`
      );
    }
    if (cod === '401') {
      throw new WeatherApiError(
        'auth',
        'Weather service authentication failed. The API key may be inactive or invalid.'
      );
    }
    return data;
  }

  // HTTP error path — map meaningful status codes
  if (response.status === 404) {
    throw new WeatherApiError(
      'not_found',
      `We couldn't find "${city}". Check the spelling or try a nearby larger city.`
    );
  }
  if (response.status === 401) {
    throw new WeatherApiError(
      'auth',
      'Weather service authentication failed. The API key may be inactive or invalid.'
    );
  }
  if (response.status === 429) {
    throw new WeatherApiError(
      'rate_limit',
      'Too many requests. Please wait a moment and try again.'
    );
  }

  throw new WeatherApiError(
    'api',
    `The weather service returned an unexpected error (HTTP ${response.status}). Please try again.`
  );
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
