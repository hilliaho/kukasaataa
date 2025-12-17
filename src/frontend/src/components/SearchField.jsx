import { useState, useContext } from 'react';
import LanguageContext from '../LanguageContext';

const SearchField = ({ searchQuery, setSearchQuery, handleSearch }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const { texts } = useContext(LanguageContext)
    const t = texts.searchField

    return (
        <div className='search-container'>
            <label htmlFor="search-input" className="search-label">
                {t.label}
            </label>
            <input
                id="search-input"
                type="text"
                placeholder={t.placeholder}
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
                <p>{t.instructions[0]}</p>
                <p>{t.instructions[1]} <a className='link' href='https://lakitutka.fi/' target='_blank' rel='noopener noreferrer'>{t.instructions[2]}</a>.</p>
            </div>
        </div>
    );
};

export default SearchField;
