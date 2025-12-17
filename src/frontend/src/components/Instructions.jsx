import { useContext } from "react"
import LanguageContext from "../LanguageContext"


const Instructions = ({ instructions, setInstructions }) => {
  const { texts } = useContext(LanguageContext)
  const t = texts.instructions

  return (
    <div className="instructions">
      <button className="x-button" onClick={() => setInstructions(!instructions)}>X</button>
      <p>{t.instructions[0]}</p>
      <p>{t.instructions[1]}</p>
      <p>{t.instructions[2]}</p>
      <p>{t.instructions[3]}</p>
      <p>{t.instructions[4]}</p>
    </div>
  )
}

export default Instructions