import React from "react";
import { useState } from "react"
import { useNavigate } from "react-router-dom";

const HomeView = ({ API_URL, joinCode, setJoinCode, debugLog, debugError, setSelectedProjects }) => {
  const navigate = useNavigate()
  const [showEditCodeInput, setShowEditCodeInput] = useState(false)
  const [editCode, setEditCode] = useState('')

  const handleJoinWithCode = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch(`${API_URL}/selections/join/${joinCode}`);
      const data = await res.json();
      if (!res.ok) {
        alert(`Koodilla ${joinCode} ei löytynyt dokumentteja. Tarkista, että koodi on oikein.`);
        return;
      }
      debugLog("[HomeView]: Oppilaan data:", data);
      navigate(`/student/${joinCode}`)
    } catch (error) {
      debugError("[HomeView]: Virhe liittyessä alustalle:", error);
      alert("Jokin meni pieleen. Yritä uudelleen.");
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/selections/edit/${editCode}`);
      const data = await res.json();
      if (data) {
        debugLog("Muokattava data:", data);
        setSelectedProjects(data.documents)
        setJoinCode(data.joinCode)
        navigate(`/${editCode}/select-projects`)
      } else {
        alert("Koodilla ei löytynyt dokumentteja.");
      }
    } catch (error) {
      debugError("Virhe liittyessä alustalle:", error);
      alert("Jokin meni pieleen. Yritä uudelleen.");
    }
  }

  const createNewSession = () => {
    const join = generateCode();
    const edit = generateCode();
    setJoinCode(join);
    navigate(`/${edit}/select-projects`)
  }

  const generateCode = () => {
    const chars = '123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };



  return (
    <div className="center-container">
      <h1>Kuka säätää?</h1>

      <div style={{ marginTop: "60px" }}>
        <h2>Osallistu oppilaana</h2>
        <form onSubmit={handleJoinWithCode}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Syötä koodi"
            style={{ padding: "10px", fontSize: "16px", marginTop: "10px" }}
          />
          <button
            type="submit"
            style={{ marginTop: "15px" }}
          >
            Liity alustalle
          </button>
        </form>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Luo uusi tai muokkaa dokumenttivalikoimaa</h3>
        <button
          onClick={createNewSession}
        >
          Luo uusi
        </button>
        {showEditCodeInput &&
          <>
            <div>
              <input
                type="text"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder="Syötä muokkauskoodi"
                style={{ padding: "10px", fontSize: "16px", marginTop: "10px" }}
              />
              <button
                onClick={() => handleEdit()}
                style={{ marginTop: "15px" }}
              >
                Muokkaa
              </button>
            </div>
          </>}
        {!showEditCodeInput &&
          <button
            onClick={() => setShowEditCodeInput(true)}
            style={{ marginTop: "15px" }}
          >
            Muokkaa
          </button>
        }
      </div>

    </div>
  )
}

export default HomeView