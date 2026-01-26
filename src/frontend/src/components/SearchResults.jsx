import { useContext } from 'react';
import Project from './Project';
import LanguageContext from '../LanguageContext';

const SearchResults = ({ results, selectedProjects, setSelectedProjects, searchQuery }) => {
	const { texts } = useContext(LanguageContext)
	const t = texts.searchResults

	return (
		<div className='project-container'>
			{searchQuery ? (<h2>{t.results} "{searchQuery}"</h2>) : (<h2>{t.allProjects}</h2>)}
			{results.map((project, index) => (
				<div className='project-container' key={index}>
					<Project
						key={project._id}
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