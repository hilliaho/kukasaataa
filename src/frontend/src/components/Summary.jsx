import Project from "./Project"

const Summary = ({ selectedProjects }) => {
    return (
			<div className="center-container">
				<h1>Yhteenveto</h1>
				<p>Valitut hankkeet:</p>
				<ul>
					{selectedProjects.map(p => 
						<Project project={p}/>
					)}
				</ul>
			</div>
    )
}

export default Summary