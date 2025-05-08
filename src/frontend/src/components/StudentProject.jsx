import React from 'react';
import { useState } from 'react';
import PreparatoryDocuments from './PreparatoryDocuments';

const StudentProject = ({ project }) => {
  const [expandedContent, setExpandedContent] = useState(true);

  return (
            <div key={project._id} className='project-item'>
        <button className='he-identifier-button' onClick={() => setExpandedContent(!expandedContent)}>{project.heTunnus}</button>
        <div className="download-a">
          <a href={project.heUrl}>{project.heNimi}</a>
        </div>
        {expandedContent &&
          <div className='expanded-content'>
            <h3>Valmisteluasiakirjat</h3>
            <PreparatoryDocuments submissions={project.dokumentit.lausunnot} name={"Lausunnot"} />
            <PreparatoryDocuments submissions={project.dokumentit.asiantuntijalausunnot} name={"Asiantuntijalausunnot"} />
            <PreparatoryDocuments submissions={project.dokumentit.valiokuntaAsiakirjat} name={"Valiokunta-asiakirjat"} />
          </div>}
      </div>
  )
}

export default StudentProject;