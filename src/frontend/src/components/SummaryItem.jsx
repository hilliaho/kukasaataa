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
        <PreparatoryDocuments submissions={project.dokumentit.lausunnot.filter((d) => d.selected)} name={"Lausunnot"} />
        <PreparatoryDocuments submissions={project.dokumentit.asiantuntijalausunnot.filter((d) => d.selected)} name={"Asiantuntijalausunnot"} />
        <PreparatoryDocuments submissions={project.dokumentit.valiokunnanLausunnot.filter((d) => d.selected)} name={"Valiokunnan lausunnot"} />
        <PreparatoryDocuments submissions={project.dokumentit.valiokunnanMietinnot.filter((d) => d.selected)} name={"Valiokunnan mietinnöt"} />
      </div>
    </div>
  )
}

export default SummaryItem