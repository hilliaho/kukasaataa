import React from "react"
import DocumentInfo from "./DocumentInfo"

const Project = ({project}) => {

	console.log("project: ", project)
	return (
		<div className="result-item">
			<p><strong>HANKE {project.heIdentifier}</strong></p>
			<p>{project.name}</p>
			<ul>
				{<DocumentInfo name={"Lausuntokierroksen lausunnot"} documentList={project.submissions ?? []}/>}
			</ul>
		</div>
	)
}

export default Project