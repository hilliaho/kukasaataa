import React from "react"
import DocumentInfo from "./DocumentInfo"

const Project = ({project, setSelectedProjects}) => {
	return (
		<div className="result-item">
			<p><strong>HANKE {project.heTunnus}</strong></p>
			<p>{project.heNimi}</p>
			<ul>
				{<DocumentInfo projectId={project._id} objectName={"lausunnot"} header={"Lausuntokierroksen lausunnot"} submissions={project.dokumentit.lausunnot ?? []} setSelectedProjects={setSelectedProjects}/>}
				{<DocumentInfo projectId={project._id} objectName={"asiantuntijalausunnot"} header={"Asiantuntijalausunnot"} submissions={project.dokumentit.asiantuntijalausunnot ?? []} setSelectedProjects={setSelectedProjects}/>}
				{<DocumentInfo projectId={project._id} objectName={"valiokuntaAsiakirjat"} header={"Valiokunta-asiakirjat"} submissions={project.dokumentit.valiokuntaAsiakirjat ?? []} setSelectedProjects={setSelectedProjects}/>}
			</ul>
		</div>
	)
}

export default Project