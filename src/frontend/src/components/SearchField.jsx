import React, { useState } from 'react';

const SearchField = ({ searchQuery, setSearchQuery, handleSearch }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);

    return (
        <div style={{ marginTop: '20px' }}>
            <label htmlFor="search-input" className="search-label">
                Valitse hanke tai hankkeet, joita haluat käyttää simulaatiossa
            </label>
            <input
                id="search-input"
                type="text"
                placeholder="Hae hallituksen esityksistä"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        setSearchQuery(localQuery)
                        handleSearch();
                    }
                }}
            />
            <button onClick={() => { setSearchQuery(localQuery); handleSearch(); }}>
                Hae
            </button>  
        </div>
    );
};

export default SearchField;
