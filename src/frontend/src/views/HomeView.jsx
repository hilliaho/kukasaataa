import React from "react";
import { useNavigate } from "react-router-dom";

const HomeView = ({API_URL, setStudentProjects, joinCode, setJoinCode, debugError}) => {
  const navigate = useNavigate()


  const handleJoinWithCode = async () => {
    try {
      const res = await fetch(`${API_URL}/selections/${joinCode}`);
      const data = await res.json();

      if (data) {
        console.log("Oppilaan data:", data);
        setStudentProjects(data.documents);
        navigate('/student')
      } else {
        alert("Koodilla ei löytynyt dokumentteja.");
      }
    } catch (error) {
      debugError("Virhe liittyessä peliin:", error);
      alert("Jokin meni pieleen. Yritä uudelleen.");
    }
  };

  return (
        <div className="center-container">
          <h1>Kuka säätää?</h1>

          <button
            onClick={() => {
              navigate('/select-projects')
            }}
            style={{ marginTop: "40px" }}
          >
            Luo uusi peli
          </button>

          <div style={{ marginTop: "60px" }}>
            <h2>Osallistu oppilaana</h2>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Syötä opettajan antama koodi"
              style={{ padding: "10px", fontSize: "16px", marginTop: "10px" }}
            />
            <button
              onClick={handleJoinWithCode}
              style={{ marginTop: "15px" }}
            >
              Liity peliin
            </button>
          </div>
        </div>
  )
}

export default HomeView