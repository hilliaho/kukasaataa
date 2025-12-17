import { useContext } from 'react';
import Project from './Project';
import LanguageContext from '../LanguageContext';

const SearchResults = ({ results, selectedProjects, setSelectedProjects, searchQuery }) => {
	const { texts } = useContext(LanguageContext)
	const t = texts.searchResults

	return (
		<div className='project-container'>
			{searchQuery ? (<h3>{t.results} "{searchQuery}"</h3>) : (<h3>{t.allProjects}</h3>)}
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