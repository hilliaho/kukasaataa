import React, { useState } from "react"
import Submission from "./Submission"
import arrow from '../assets/dropdown-arrow.png'


const DocumentInfo = ({ submissions, name }) => {
	const [expanded, setExpanded] = useState(false)
	const [submissionList, setSubmissionList] = useState(
		submissions.map(sub => ({ ...sub, selected: true }))
	)

	const handleCheckboxChange = () => {
		const newSelectedState = !submissionList.every(sub => sub.selected)
		const updatedSubmissions = submissionList.map(sub => ({
			...sub,
			selected: newSelectedState
		}))
		setSubmissionList(updatedSubmissions)
	}

	const updateSubmissionSelection = (index, isSelected) => {
		const updatedSubmissions = [...submissionList]
		updatedSubmissions[index].selected = isSelected
		setSubmissionList(updatedSubmissions)
	}

	return (
		<div>
			<div className="content-row">
			<input
				type="checkbox"
				checked={submissionList.some(sub => sub.selected)}
				onChange={handleCheckboxChange}
			/>
			<p className='document-info-name' onClick={() => setExpanded(!expanded)}>
				{name} ({submissions.length})
				<img
					className='dropdown-arrow'
					src={arrow}
					alt='dropdown arrow'
					onClick={() => setExpanded(!expanded)}
				/>
			</p>
			</div>
			{expanded &&
				<div>
					<ul>
						<div className="preparatory-documents">
							{submissionList.length > 0 ? (
								submissionList.map((submission, index) => (
									<Submission
										key={index}
										submission={submission}
										onSelectionChange={(isSelected) => updateSubmissionSelection(index, isSelected)}
									/>
								))
							) : (
								<p>Ei lausuntoja.</p>
							)}
						</div>
					</ul>
				</div>
			}

		</div>
	)
}

export default DocumentInfo
