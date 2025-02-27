import Project from "./Project"

const Summary = ({ selectedProjects }) => {
    return (
			<div className="center-container">
				<h1>Yhteenveto</h1>
				<p>Valitut hankkeet:</p>
				<ul>
					{selectedProjects.map((p, index) => 
						<div key={index}><Project project={p}/></div>
					)}
				</ul>
			</div>
    )
}

export default Summary