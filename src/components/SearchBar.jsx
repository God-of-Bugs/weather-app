/**
 * SearchBar component.
 *
 * Renders a city search form with an input and submit button.
 * Handles trimming, empty-input rejection, and keyboard submission.
 */

/**
 * @param {{
 *   onSearch: (city: string) => void,
 *   isLoading: boolean
 * }} props
 */
function SearchBar({ onSearch, isLoading }) {
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const city = form.elements.city.value.trim();
    if (!city) return;
    onSearch(city);
  }

  return (
    <form
      className="search-form"
      onSubmit={handleSubmit}
      role="search"
      aria-label="City weather search"
    >
      <label htmlFor="city-input" className="search-label">
        Search city
      </label>
      <div className="search-row">
        <input
          id="city-input"
          name="city"
          type="search"
          className="search-input"
          placeholder="Enter a city name…"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck="false"
          disabled={isLoading}
          aria-label="City name"
        />
        <button
          type="submit"
          className="search-btn"
          disabled={isLoading}
          aria-label="Search weather"
        >
          {isLoading ? (
            <span className="btn-spinner" aria-hidden="true" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="search-icon"
              width="18"
              height="18"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          <span>{isLoading ? 'Searching…' : 'Search'}</span>
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
