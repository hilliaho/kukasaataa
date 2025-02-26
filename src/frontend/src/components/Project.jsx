import React from "react"
import DocumentInfo from "./DocumentInfo"

const Project = ({project}) => {

	console.log("project: ", project)
	return (
		<div className="result-item">
			<p><strong>HANKE {project.heTunnus}</strong></p>
			<p>{project.heNimi}</p>
			<ul>
				{<DocumentInfo name={"Lausuntokierroksen lausunnot"} documentList={project.dokumentit.lausunnot ?? []}/>}
				{<DocumentInfo name={"Asiantuntijalausunnot"} documentList={project.dokumentit.asiantuntijalausunnot ?? []}/>}
				{<DocumentInfo name={"Valiokunta-asiakirjat"} documentList={project.dokumentit.valiokuntaAsiakirjat ?? []}/>}
			</ul>
		</div>
	)
}

export default Project