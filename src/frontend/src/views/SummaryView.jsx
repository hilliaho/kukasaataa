import React from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SummaryItem from "../components/SummaryItem"

const SummaryView = ({ joinCode, editCode, selectedProjects }) => {
  const navigate = useNavigate()

  useEffect(() => {
    if(!joinCode || !editCode || !selectedProjects) {
      navigate('/select-documents')
    }
  }, [joinCode, editCode, selectedProjects, navigate]);

  return (
    <div>
      <div className="code-notification">
        <h3>
          Materiaalivalinnat tallennettu.
        </h3>
        <p>
          Pelialustan liittymiskoodi:
        </p>
        <strong>{joinCode}</strong>
        <p>
          Pelialustan muokkaamiskoodi:
        </p>
        <strong>{editCode}</strong>
      </div>
      <h3>Valitut asiakirjat</h3>
      <ul>
        {selectedProjects.map((project, index) => <div key={index}><SummaryItem project={project}/></div>)}
      </ul>
    </div>
  )
}

export default SummaryView