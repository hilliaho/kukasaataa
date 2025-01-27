import React from 'react';
import ResultItem from './ResultItem';
import DocumentPage from './ProposalContent';

const SearchResults = ({ results, selectedProjects, handleCheckboxChange, searchQuery }) => {
    return (
        <div className='projects-container'>
            <h2>Hakutulokset</h2>
            {results.length === 0 ? (
                <p>Ei hakutuloksia hakusanalla {searchQuery}</p>
            ) : (
                results.filter(result => !selectedProjects.includes(result.id)).map(result => (
                    <ResultItem
                        key={result.id}
                        result={result}
                        isSelected={selectedProjects.includes(result.id)}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                ))
            )}
        </div>
    );
};

export default SearchResults;