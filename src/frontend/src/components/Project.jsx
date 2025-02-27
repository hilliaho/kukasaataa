import React from "react"
import DocumentInfo from "./DocumentInfo"

const Project = ({project}) => {

	console.log("project: ", project)
	return (
		<div className="result-item">
			<p><strong>HANKE {project.heTunnus}</strong></p>
			<p>{project.heNimi}</p>
			<ul>
				{<DocumentInfo name={"Lausuntokierroksen lausunnot"} submissions={project.dokumentit.lausunnot ?? []}/>}
				{<DocumentInfo name={"Asiantuntijalausunnot"} submissions={project.dokumentit.asiantuntijalausunnot ?? []}/>}
				{<DocumentInfo name={"Valiokunta-asiakirjat"} submissions={project.dokumentit.valiokuntaAsiakirjat ?? []}/>}
			</ul>
		</div>
	)
}

export default Project