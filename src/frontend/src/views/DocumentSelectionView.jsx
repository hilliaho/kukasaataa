import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import Project from "../components/Project"
import { useLocation } from 'react-router-dom'

const DocumentSelectionView = ({ API_URL, selectedProjects, setSelectedProjects, setLoading, joinCode, debugLog, debugError }) => {
  
  const navigate = useNavigate()
  const location = useLocation()
  const editCode = location.pathname.split("/")[1]

  useEffect(() => {
    if (selectedProjects.length === 0) {
      navigate(`/${editCode}/select-projects`)
    }
  }, [selectedProjects, navigate, editCode]);

  const handleBackToSelection = () => {
    navigate(`/${editCode}/select-projects`)
  }

  const createSelection = async () => {
    setLoading(true);
    console.log("Create selection: Selected projects:", selectedProjects);

    const cleanedProjects = selectedProjects
      .map((project) => {
        const cleanedDokumentit = {};

        for (const [key, docs] of Object.entries(project.dokumentit)) {
          if (Array.isArray(docs)) {
            const selectedDocs = docs.filter((doc) => doc.selected);
            if (selectedDocs.length > 0) {
              cleanedDokumentit[key] = selectedDocs;
            }
          }
        }

        const hasSelectedDocuments = Object.values(cleanedDokumentit).some(
          (docs) => docs.length > 0
        );

        if (!hasSelectedDocuments) {
          return null;
        }

        return {
          ...project,
          dokumentit: cleanedDokumentit,
        };
      })
      .filter((p) => p !== null);

    const payload = {
      joinCode,
      editCode,
      documents: cleanedProjects,
    };

    try {
      const response = await fetch(`${API_URL}/selections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      debugLog("Selection: ", payload)
      const data = await response.json();
      navigate(`/${editCode}/summary`)

      return data;
    } catch (error) {
      debugError("Error creating code:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="back-button">
        <BackButton handleFunction={handleBackToSelection} />
      </div>
      <div className="center-container">
        <h1>Valitse asiakirjat</h1>
        <p>Valitut hankkeet:</p>
        <ul>
          {selectedProjects.map((p, index) =>
            <div key={index}><Project project={p} setSelectedProjects={setSelectedProjects} /></div>
          )}
        </ul>
      </div>
      <button className="continue-button" onClick={createSelection}>
        Tallenna valinnat
      </button>
    </>
  )
}

export default DocumentSelectionView