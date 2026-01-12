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
                {t.button}
            </button>
            <div className='page-instructions'>
                <p>{t.instructions.text[0]}</p>
                <p>{t.instructions.text[1]} <a href={t.instructions.link} target='_blank' rel='noopener noreferrer'>{t.instructions.linkName}</a>.</p>
                <p>{t.instructions.text[2]}</p>
            </div>
        </div>
    );
};

export default SearchField;
