import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom";
import LanguageContext from "../LanguageContext";

const HomeView = ({ API_URL, joinCode, setJoinCode, debugLog, debugError, setSelectedProjects, setRole }) => {
  const navigate = useNavigate()
  const [showEditCodeInput, setShowEditCodeInput] = useState(false)
  const [editCode, setEditCode] = useState('')
  const { texts } = useContext(LanguageContext)
  const t = texts.home

  const handleJoinWithCode = async (e) => {
    try {
      e.preventDefault();
      const res = await fetch(`${API_URL}/selections/join/${joinCode}`);
      if (!res.ok) {
        alert(`${t.wrongCodeNotification}`);
        return;
      }
      const data = await res.json();
      setRole("student");
      debugLog("[HomeView] Oppilaan data:", data);
      navigate(`/student/${joinCode}`)
    } catch (error) {
      debugError("[HomeView]: Virhe liittyessä alustalle:", error);
      alert("Jokin meni pieleen. Yritä uudelleen.");
    }
  };

  const handleEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/selections/edit/${editCode}`);
      if (!res.ok) {
        alert(`${t.wrongCodeNotification}`);
        return;
      }
      const data = await res.json();
      debugLog("[HomeView] Muokattava data:", data);
      setSelectedProjects(data.documents);
      setJoinCode(data.joinCode);
      navigate(`/${editCode}/select-projects`)
    } catch (error) {
      debugError("Virhe liittyessä alustalle:", error);
      alert(t.error);
    }
  }

  const createNewSession = () => {
    const join = generateCode();
    const edit = generateCode();
    setJoinCode(join);
    setRole("teacher");
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

      <div className="join-form">
        <h2>{t.join}</h2>
        <form onSubmit={handleJoinWithCode}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder={t.codeInput}
          />
          <button
            type="submit"
          >
            {t.joinButton}
          </button>
        </form>
      </div>

      <div className="create-form">
        <h2>{t.createOrEdit}</h2>
        <button
          onClick={createNewSession}
        >
          {t.createButton}
        </button>
        {showEditCodeInput &&
          <>
            <div>
              <input
                type="text"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder={t.editCodePlaceholder}
              />
              <button
                onClick={() => handleEdit()}
                style={{ marginTop: "15px" }}
              >
                {t.editButton}
              </button>
            </div>
          </>}
        {!showEditCodeInput &&
          <button
            onClick={() => setShowEditCodeInput(true)}
            style={{ marginTop: "15px" }}
          >
            {t.editButton}
          </button>
        }
      </div>

      <div className="home-instructions">
        <p>{t.instructions[0]}</p>
        <p>{t.instructions[1]}</p>
        <p>{t.instructions[2]}</p>
        <p>{t.instructions[3]}</p>
      </div>

    </div>
  )
}

export default HomeView