const Instructions = ({instructions, setInstructions}) => {
   return (
    <div className="instructions">
      <button className="x-button" onClick={() => setInstructions(!instructions)}>X</button>
      <p>Ohjeet</p>

    </div>
   )
}

export default Instructions