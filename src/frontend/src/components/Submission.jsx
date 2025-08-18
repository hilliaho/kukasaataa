import React, { useState, useEffect } from "react"

const Submission = ({ submission, onSelectionChange }) => {
    const [isSelected, setSelected] = useState(submission.selected)

    useEffect(() => {
        setSelected(submission.selected)
    }, [submission.selected])

    const handleCheckboxChange = () => {
        const newSelected = !isSelected
        setSelected(newSelected)
        onSelectionChange(newSelected)
    }

    return (
        <div className="submission">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
            />
            {<a href={submission.url}>{submission.nimi}</a>}
        </div>
    )
}

export default Submission
