import React from "react"
import DocumentInfo from "./DocumentInfo"

const Project = ({project}) => {

	console.log("project: ", project)
	return (
		<div className="result-item">
			<p><strong>HANKE {project.heTunnus}</strong></p>
			<p>{project.heNimi}</p>
			<ul>
				{<DocumentInfo name={"Lausuntokierroksen lausunnot"} documentList={project.lausunnot ?? []}/>}
			</ul>
		</div>
	)
}

export default Project