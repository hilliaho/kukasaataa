import React from 'react';

const SearchField = ({ searchQuery, setSearchQuery, handleSearch }) => {
    return (
        <div style={{ marginTop: '20px' }}>
            <label htmlFor="search-input" className="search-label">Valitse hanke tai hankkeet, joita haluat käyttää simulaatiossa</label>
            <input
                id="search-input"
                type="text"
                placeholder="Hae hallituksen esityksistä"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Hae</button>
        </div>
    );
};

export default SearchField;