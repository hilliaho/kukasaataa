import React from 'react';
import Project from './Project';

const SearchResults = ({ results, selectedProjects, setSelectedProjects, searchQuery }) => {
	return (
		<div className='project-container'>
			{searchQuery ? (<h3>Hakutulokset hakusanalla "{searchQuery}"</h3>):(<h3>Kaikki hankkeet</h3>)}
			{results.filter(result => !selectedProjects.includes(result)).map((project, index) => (
					<div className='project-container' key={index}>
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