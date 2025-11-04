const Instructions = ({ instructions, setInstructions }) => {
  return (
    <div className="instructions">
      <button className="x-button" onClick={() => setInstructions(!instructions)}>X</button>
      <p>Ohjeet</p>
      <p>Tämä on Kuka säätää? -lainvalmistelupelin verkkoalusta, jossa voit valita materiaalit peliin ja jakaa ne simulaation osallistujille.</p>
      <p>Jos olet pelin osallistuja, voit syöttää saamasi koodin yllä olevaan kenttään.</p>
      <p>Jos olet pelin järjestäjä, voit luoda uuden pelin tai muokata aiemmin luomaasi peliä. Tarvittaessa voit katsoa lisäohjeita yläkulman linkistä ”Ohjeet”.</p>
      <p>Muista ottaa lopuksi talteen pelisi jako- ja muokkauskoodit!</p>
    </div>
  )
}

export default Instructions