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
      if (!res.ok) {
        alert(`Koodilla ${joinCode} ei löytynyt dokumentteja. Tarkista, että koodi on oikein.`);
        return;
      }
      const data = await res.json();
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
        alert(`Koodilla ${editCode} ei löytynyt dokumentteja. Tarkista, että koodi on oikein.`);
        return;
      }
      const data = await res.json();
      debugLog("[HomeView] Muokattava data:", data);
      setSelectedProjects(data.documents)
      setJoinCode(data.joinCode)
      navigate(`/${editCode}/select-projects`)
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

      <div className="join-form">
        <h2>Osallistu peliin</h2>
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

      <div className="create-form">
        <h3>Luo tai muokkaa pelimateriaaleja</h3>
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

      <div className="home-instructions">
        <p>Tämä on Kuka säätää? -lainvalmistelupelin verkkoalusta, jossa voit valita materiaalit peliin ja jakaa ne simulaation osallistujille.</p>
        <p>Jos olet pelin osallistuja, voit syöttää saamasi koodin yllä olevaan kenttään.</p>
        <p>Jos olet pelin järjestäjä, voit luoda uuden pelin tai muokata aiemmin luomaasi peliä. Tarvittaessa voit katsoa lisäohjeita yläkulman linkistä ”Ohjeet”.</p>
        <p>Muista ottaa lopuksi talteen pelisi jako- ja muokkauskoodit!</p>
      </div>

    </div>
  )
}

export default HomeView