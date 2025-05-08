import Project from "./Project"

const Summary = ({ selectedProjects, setSelectedProjects }) => {
    return (
			<div className="center-container">
				<h1>Yhteenveto</h1>
				<p>Valitut hankkeet:</p>
				<ul>
					{selectedProjects.map((p, index) => 
						<div key={index}><Project project={p} setSelectedProjects={setSelectedProjects}/></div>
					)}
				</ul>
			</div>
    )
}

export default Summary