import React from 'react';
import ResultItem from './ResultItem';

const SearchResults = ({ results, selectedProjects, handleCheckboxChange, searchQuery }) => {
	return (
		<div className='projects-container'>
			{searchQuery ? (<h2>Hakutulokset hakusanalla "{searchQuery}"</h2>):(<h2>Kaikki hankkeet</h2>)}
			{results.filter(result => !selectedProjects.includes(result)).map(result => (
					<ResultItem
						key={result.id}
						result={result}
						isSelected={selectedProjects.includes(result.id)}
						handleCheckboxChange={handleCheckboxChange}
					/>
				))}
		</div>
	);
};

export default SearchResults;