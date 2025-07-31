import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import Project from "../components/Project"

const DocumentSelectionView = ({ API_URL, selectedProjects, setSelectedProjects, setLoading, setEditCode, setJoinCode, debugLog, debugError }) => {
  
  const navigate = useNavigate()

  useEffect(() => {
    if (selectedProjects.length === 0) {
      navigate('/select-projects')
    }
  }, [selectedProjects, navigate]);

  const handleBackToSelection = () => {
    navigate('/select-projects')
  }

  const createCode = async () => {
    setLoading(true);
    console.log("Create code: Selected projects:", selectedProjects);

    const generateCode = () => {
      const chars = '123456789';
      let result = '';
      for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const joinCode = generateCode();
    const editCode = generateCode();
    setEditCode(editCode);
    setJoinCode(joinCode);

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
      debugLog("Code created:", joinCode);
      debugLog("Edit code created:", editCode);
      navigate('/summary')

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
      <button className="continue-button" onClick={createCode}>
        Tallenna valinnat ja luo koodi
      </button>
    </>
  )
}

export default DocumentSelectionView