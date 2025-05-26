import React from "react"
import DocumentInfo from "./DocumentInfo"

const Project = ({project, setSelectedProjects}) => {
	return (
		<div className="project-item">
			<p><strong>HANKE {project.heTunnus}</strong></p>
			<p>{project.heNimi}</p>
			<ul>
				{<DocumentInfo projectId={project._id} objectName={"lausunnot"} header={"Lausuntokierroksen lausunnot"} submissions={project.dokumentit.lausunnot ?? []} setSelectedProjects={setSelectedProjects}/>}
				{<DocumentInfo projectId={project._id} objectName={"asiantuntijalausunnot"} header={"Asiantuntijalausunnot"} submissions={project.dokumentit.asiantuntijalausunnot ?? []} setSelectedProjects={setSelectedProjects}/>}
				{<DocumentInfo projectId={project._id} objectName={"valiokunnanLausunnot"} header={"Valiokunnan lausunnot"} submissions={project.dokumentit.valiokunnanLausunnot ?? []} setSelectedProjects={setSelectedProjects}/>}
				{<DocumentInfo projectId={project._id} objectName={"valiokunnanMietinnot"} header={"Valiokunnan mietinnöt"} submissions={project.dokumentit.valiokunnanMietinnot ?? []} setSelectedProjects={setSelectedProjects}/>}
			</ul>
		</div>
	)
}

export default Project