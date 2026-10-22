const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

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
    throw new WeatherApiError(
      'network',
      'Unable to reach the weather service. Check your internet connection and try again.'
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new WeatherApiError(
      'api',
      `The weather service returned an unreadable response (HTTP ${response.status}).`
    );
  }

  if (response.ok) {
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
 * Fetch current weather by geographical coordinates.
 * Deterministic location search — eliminates city name collisions.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {{ name: string, state?: string, country?: string }} [locationContext]
 * @returns {Promise<Object>} OpenWeatherMap current-weather response
 * @throws {WeatherApiError}
 */
export async function fetchWeatherByCoords(lat, lon, locationContext) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const url = new URL(`${BASE_URL}/weather`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');

  let response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw new WeatherApiError(
      'network',
      'Unable to reach the weather service. Check your internet connection and try again.'
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new WeatherApiError(
      'api',
      `The weather service returned an unreadable response (HTTP ${response.status}).`
    );
  }

  if (response.ok) {
    // If a custom geocoded location context was provided, attach it for precise display
    if (locationContext) {
      data.customLocation = locationContext;
    }
    return data;
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
 * Search worldwide locations by place name, city, town, or locality.
 * Uses OpenWeather Geocoding Direct API with AbortSignal support.
 *
 * @param {string} query - Place query (e.g. "Ran", "Patratu", "Tokyo")
 * @param {AbortSignal} [signal] - Optional AbortSignal for stale request cancellation
 * @returns {Promise<Array<{ name: string, state?: string, country: string, lat: number, lon: number }>>}
 */
export async function searchLocations(query, signal) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const url = new URL(`${GEO_URL}/direct`);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', '6');
  url.searchParams.set('appid', apiKey);

  try {
    const response = await fetch(url.toString(), { signal });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    // Deduplicate matching results by lat/lon or name+state+country
    const seen = new Set();
    const results = [];

    for (const item of data) {
      if (!item.name || item.lat == null || item.lon == null) continue;
      const key = `${item.name}|${item.state || ''}|${item.country || ''}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          name: item.name,
          state: item.state || '',
          country: item.country || '',
          lat: item.lat,
          lon: item.lon,
        });
      }
    }

    return results;
  } catch (err) {
    // If aborted, rethrow or return empty silently
    if (err.name === 'AbortError') {
      return [];
    }
    // Graceful fallback for geocoding network glitches
    return [];
  }
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
