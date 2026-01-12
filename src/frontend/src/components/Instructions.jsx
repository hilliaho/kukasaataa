import { useContext } from "react"
import LanguageContext from "../LanguageContext"


const Instructions = ({ instructions, setInstructions, role }) => {
  const { texts } = useContext(LanguageContext)

  let t = texts.instructions

  if (role === "student") {
    t = texts.studentInstructions
  }


  return (
    <div className="instructions">
      <button className="x-button" onClick={() => setInstructions(!instructions)}>X</button>
      {role === "student" &&
        <div>
          <p>{t[0]}</p>
          <p>{t[1]}</p>
          <p>{t[2]}</p>
        </div>
      }
      {role !== "student" &&
        <div>
          <p>{t.text[0]}</p>
          <p>{t.text[1]} <a href={t.link} target="_blank" rel="noopener noreferrer">{t.linkName}</a>.</p>
          <p>{t.text[2]}</p>
          <p>{t.text[3]}</p>
          <p>{t.text[4]}</p>
        </div>
      }

    </div>
  )
}

export default Instructions