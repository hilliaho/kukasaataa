import { useContext } from "react";
import LanguageContext from "../LanguageContext";


const BackButton = ({ handleFunction }) => {
  const { texts } = useContext(LanguageContext)
  const t = texts.backButton

  return <button className="back-button" onClick={handleFunction}>{t.backButton}</button>;
};

export default BackButton;
