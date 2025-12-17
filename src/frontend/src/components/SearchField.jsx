import React, { useState } from 'react';

const SearchField = ({ searchQuery, setSearchQuery, handleSearch }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);

    return (
        <div className='search-container'>
            <label htmlFor="search-input" className="search-label">
                Valitse hanke tai hankkeet, joita haluat käyttää pelissä
            </label>
            <input
                id="search-input"
                type="text"
                placeholder="Hae lakihankkeista"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        setSearchQuery(localQuery)
                        handleSearch(localQuery);
                    }
                }}
            />
            <button onClick={() => { setSearchQuery(localQuery); handleSearch(localQuery); }}>
                Hae
            </button>
            <div className='page-instructions'>
                <p>Voit hakea hankkeita hakusanalla (esim. nikotiinipussi) tai diaarinumerolla (esim. HE 96/2025). </p>
                <p>Jos et vielä tiedä, mitä lakihanketta haluat käyttää pelissä, voit etsiä sopivaa <a className='link' href='https://lakitutka.fi/' target='_blank' rel='noopener noreferrer'>Lakitutkasta</a></p>
            </div>
        </div>
    );
};

export default SearchField;
