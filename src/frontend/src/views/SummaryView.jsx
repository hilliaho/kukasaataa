import { useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import BackButton from "../components/BackButton"
import Project from "../components/Project"
import LanguageContext from "../LanguageContext"

const SummaryView = ({ joinCode, setJoinCode, selectedProjects, setSelectedProjects }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const editCode = location.pathname.split("/")[1]
  const { texts } = useContext(LanguageContext)
  const t = texts.summary


  useEffect(() => {
    if(!joinCode || !selectedProjects) {
      navigate(`/${editCode}/select-documents`)
    }
  }, [joinCode, editCode, selectedProjects, navigate]);

  const handleBackToSelection = () => {
    navigate(`/${editCode}/select-documents`)
  }

  const handleBackToHome = () => {
    if(window.confirm(t.confirm)) {
      setJoinCode('')
      setSelectedProjects([])
      navigate("/")
    }
  }

  return (
    <div className="center-container">
      <BackButton handleFunction={handleBackToSelection} />
      <button className="continue-button" onClick={handleBackToHome}>{t.homeButton}</button>
      <div className="code-notification">
        <strong>
          {t.saved}
        </strong>
        <p>
          {t.joinCode}
        </p>
        <strong>{joinCode}</strong>
        <p>
          {t.editCode}
        </p>
        <strong>{editCode}</strong>
      </div>
      <h2>{t.selectedDocuments}</h2>
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