import React from 'react';
import Project from './Project';

const SearchResults = ({ results, selectedProjects, setSelectedProjects, searchQuery }) => {
	return (
		<div className='project-container'>
			{searchQuery ? (<h2>Hakutulokset hakusanalla "{searchQuery}"</h2>):(<h2>Kaikki hankkeet</h2>)}
			{results.filter(result => !selectedProjects.includes(result)).map((project, index) => (
					<div key={index}>
						<Project
						step={"project selection"}
						project={project}
						selectedProjects={selectedProjects}
						setSelectedProjects={setSelectedProjects}
						/>
					</div>
				))}
		</div>
	);
};

export default SearchResults;