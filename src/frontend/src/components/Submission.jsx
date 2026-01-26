import { useState, useEffect, useContext } from "react"
import LanguageContext from "../LanguageContext"


const Submission = ({ submission, onSelectionChange, type }) => {
    const [isSelected, setSelected] = useState(submission.selected ?? false)

    const { language } = useContext(LanguageContext)

    const langPrimary = language[0];
    const langFallback = language[1];

    const localized = submission[langPrimary]
        || submission[langFallback]
        || submission;

    const name = localized.nimi;
    const url = localized.url;

    useEffect(() => {
        setSelected(submission.selected ?? false)
    }, [submission.selected])

    const handleCheckboxChange = () => {
        const newSelected = !isSelected
        setSelected(newSelected)
        onSelectionChange?.(newSelected)
    }

    return (
        <div className="submission">
            {type === "checkbox" && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                />
            )}
            <a className="document-a" href={url} target="_blank" rel="noopener noreferrer">
                {name}
            </a>
        </div>
    )
}

export default Submission
