import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({
  onSearch,
  initialValue = '',
  id = 'movie-search',
  label = 'Search for a movie',
  placeholder = 'Search for a movie, e.g. Inception',
  buttonLabel = 'Search',
}) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="search-bar__input"
      />
      <button type="submit" className="search-bar__button">
        {buttonLabel}
      </button>
    </form>
  );
}
