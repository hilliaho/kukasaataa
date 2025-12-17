import { useState, useEffect } from "react"

const Submission = ({ submission, onSelectionChange, type }) => {
    const [isSelected, setSelected] = useState(submission.selected ?? false)

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
            <a href={submission.url} target="_blank" rel="noopener noreferrer">
                {submission.nimi}
            </a>
        </div>
    )
}

export default Submission
