import React from "react"
import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import BackButton from "../components/BackButton"
import Project from "../components/Project"

const SummaryView = ({ joinCode, setJoinCode, selectedProjects, setSelectedProjects }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const editCode = location.pathname.split("/")[1]


  useEffect(() => {
    if(!joinCode || !selectedProjects) {
      navigate(`/${editCode}/select-documents`)
    }
  }, [joinCode, editCode, selectedProjects, navigate]);

  const handleBackToSelection = () => {
    navigate(`/${editCode}/select-documents`)
  }

  const handleBackToHome = () => {
    if(window.confirm("Otithan liittymis- ja muokkaamiskoodin talteen? Haluatko varmasti siirtyä etusivulle?")) {
      setJoinCode('')
      setSelectedProjects([])
      navigate("/")
    }
  }

  return (
    <div>
      <div className="back-button">
        <BackButton handleFunction={handleBackToSelection} />
        <button onClick={handleBackToHome}>Etusivulle</button>
      </div>
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
      <h3 className="summary-selected-documents-h3">Valitut asiakirjat</h3>
      <ul>
        {selectedProjects.map((project, index) => <div key={index}>
          <Project 
            step={"summary"}
            project={project}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
          />
          </div>)}
      </ul>
    </div>
  )
}

export default SummaryView