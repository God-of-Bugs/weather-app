import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../services/weatherApi';

/**
 * SearchBar component with Smart Worldwide Location Autocomplete.
 *
 * Provides debounced typeahead, AbortController stale request prevention,
 * full keyboard combobox/listbox navigation (ArrowUp, ArrowDown, Enter, Escape),
 * touch-safe interaction, and coordinate-based location dispatch.
 *
 * @param {{
 *   onSearch: (city: string) => void,
 *   onSelectLocation: (loc: { name: string, state?: string, country: string, lat: number, lon: number }) => void,
 *   isLoading: boolean,
 *   compact?: boolean,
 *   showSuggestions?: boolean
 * }} props
 */
function SearchBar({
  onSearch,
  onSelectLocation,
  isLoading,
  compact = false,
  showSuggestions = false,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasQueried, setHasQueried] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const popularCities = ['Ranchi', 'Delhi', 'Mumbai', 'London', 'Tokyo', 'New York'];

  // Handle typing and instant reset for short queries
  function handleInputChange(e) {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearchingGeo(false);
      setHasQueried(false);
      setActiveIndex(-1);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    } else {
      setIsSearchingGeo(true);
    }
  }

  // Debounced geocoding search for queries >= 2 characters
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await searchLocations(trimmed, controller.signal);
        setSuggestions(results);
        setIsOpen(true);
        setHasQueried(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingGeo(false);
      }
    }, 320); // 320ms optimal debounce

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  function handleSelectSuggestion(loc) {
    const label = loc.state ? `${loc.name}, ${loc.state}` : loc.name;
    setQuery(label);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectLocation(loc);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    // If an item was highlighted with keyboard, pick it
    if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelectSuggestion(suggestions[activeIndex]);
      return;
    }

    // Otherwise standard search by typed query
    setIsOpen(false);
    setActiveIndex(-1);
    onSearch(trimmed);
  }

  function handleKeyDown(e) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;

      case 'Enter':
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[activeIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  }

  function handleClear() {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setIsSearchingGeo(false);
    setHasQueried(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handlePopularClick(city) {
    setQuery(city);
    onSearch(city);
  }

  const activeOptionId =
    isOpen && activeIndex >= 0 ? `location-option-${activeIndex}` : undefined;

  return (
    <div
      ref={containerRef}
      className={`location-search-container ${compact ? 'is-compact' : ''}`}
    >
      <form
        className="search-glass-dock"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search city or worldwide location"
      >
        <label htmlFor="location-search-input" className="sr-only">
          Search location
        </label>

        <span className="search-dock-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          ref={inputRef}
          id="location-search-input"
          name="location"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="location-autocomplete-list"
          aria-activedescendant={activeOptionId}
          className="search-dock-input"
          placeholder="Search city, town, or locality worldwide…"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck="false"
          disabled={isLoading}
          aria-label="Search location"
        />

        {isSearchingGeo && (
          <span className="geo-loading-indicator" aria-hidden="true" title="Locating...">
            <span className="geo-dot" />
          </span>
        )}

        {query && !isLoading && (
          <button
            type="button"
            className="search-clear-action"
            onClick={handleClear}
            aria-label="Clear location input"
          >
            ✕
          </button>
        )}

        <button
          type="submit"
          className="search-submit-btn"
          disabled={isLoading || !query.trim()}
          aria-label={isLoading ? 'Looking up weather' : 'Search weather'}
        >
          {isLoading ? (
            <span className="submit-spinner" aria-hidden="true" />
          ) : (
            <>
              <span className="submit-btn-text">Explore</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="14"
                height="14"
                aria-hidden="true"
                className="submit-arrow"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Floating Autocomplete Suggestions Panel */}
      {isOpen && (
        <div
          id="location-autocomplete-list"
          role="listbox"
          aria-label="Location suggestions"
          className="autocomplete-dropdown-glass"
          onMouseDown={(e) => {
            // Prevent input blur before click registers
            e.preventDefault();
          }}
        >
          {suggestions.length > 0 ? (
            <ul className="autocomplete-items-list" role="presentation">
              {suggestions.map((loc, index) => {
                const isSelected = index === activeIndex;
                const regionParts = [loc.state, loc.country].filter(Boolean);
                const regionText = regionParts.join(', ');

                return (
                  <li
                    key={`${loc.name}-${loc.lat}-${loc.lon}-${index}`}
                    id={`location-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`autocomplete-item ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleSelectSuggestion(loc)}
                  >
                    <span className="item-pin-icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <div className="item-text-wrap">
                      <span className="item-city-name">{loc.name}</span>
                      {regionText && (
                        <span className="item-region-name">{regionText}</span>
                      )}
                    </div>
                    <span className="item-coords-badge" aria-hidden="true">
                      {loc.lat > 0 ? `${loc.lat.toFixed(1)}°N` : `${Math.abs(loc.lat).toFixed(1)}°S`}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : hasQueried && !isSearchingGeo ? (
            <div className="autocomplete-empty-state">
              <span className="empty-icon" aria-hidden="true">📍</span>
              <p className="empty-text">No matching places found</p>
              <span className="empty-hint">Try searching a nearby larger town or city</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Popular Landing Quick Chips */}
      {showSuggestions && (
        <div className="landing-suggestions" aria-label="Popular cities">
          <span className="suggestions-intro">Popular skies:</span>
          <div className="suggestion-pills">
            {popularCities.map((city) => (
              <button
                key={city}
                type="button"
                className="city-suggestion-pill"
                onClick={() => handlePopularClick(city)}
                disabled={isLoading}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
