import React from 'react';
import ResultItem from './ResultItem';

const SearchResults = ({ results, selectedProjects, handleCheckboxChange, searchQuery }) => {
	return (
		<div className='project-container'>
			{searchQuery ? (<h2>Hakutulokset hakusanalla "{searchQuery}"</h2>):(<h2>Kaikki hankkeet</h2>)}
			{results.filter(result => !selectedProjects.includes(result)).map((result, index) => (
					<div key={index}><ResultItem
						key={result._id}
						result={result}
						isSelected={selectedProjects.includes(result._id)}
						handleCheckboxChange={handleCheckboxChange}
					/></div>
				))}
		</div>
	);
};

export default SearchResults;