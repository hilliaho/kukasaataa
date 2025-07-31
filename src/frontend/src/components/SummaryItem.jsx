import React from "react"
import PreparatoryDocuments from "./PreparatoryDocuments"

const SummaryItem = ({ project }) => {
  return (
    <div key={project._id} className='project-item'>
      <strong>{project.heTunnus}</strong>
      <div className="download-a">
        <a href={project.heUrl}>{project.heNimi}</a>
      </div>

      <div className='expanded-content'>
        <h3>Valmisteluasiakirjat</h3>
        <h4>Lausuntokierroksen lausunnot:</h4>
        <PreparatoryDocuments submissions={project.dokumentit.lausunnot} name={"Lausunnot"} />
        <h4>Asiantuntijalausunnot</h4>
        <PreparatoryDocuments submissions={project.dokumentit.asiantuntijalausunnot} name={"Asiantuntijalausunnot"} />
        <h4>Valiokunnan lausunnot</h4>
        <PreparatoryDocuments submissions={project.dokumentit.valiokunnanLausunnot} name={"Valiokunnan lausunnot"} />
        <h4>Valiokunnan mietinnöt</h4>
        <PreparatoryDocuments submissions={project.dokumentit.valiokunnanMietinnot} name={"Valiokunnan mietinnöt"} />
      </div>
    </div>
  )
}

export default SummaryItem