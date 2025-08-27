import React, { useState, useEffect } from "react"
import Submission from "./Submission"
import arrow from '../assets/dropdown-arrow.png'
import greyArrow from '../assets/grey-dropdown-arrow.png'


const DocumentInfo = ({ type, projectId, submissions, objectName, header, setSelectedProjects }) => {
	const [expanded, setExpanded] = useState(false)
	const [submissionList, setSubmissionList] = useState(
		submissions.sort(function (a, b) {
		if (a.nimi < b.nimi) {
			return -1;
		}
		if (a.nimi > b.nimi) {
			return 1
		}
		return 0
	})
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

	useEffect(() => {
		if (type === "checkbox") {
			setSelectedProjects(prev => {
				return prev.map(project => {
					if (project._id === projectId) {
						const updatedDokumentit = {
							...(project.dokumentit || {}),
							[objectName]: submissionList
						}
						return {
							...project,
							dokumentit: updatedDokumentit
						}
					}
					return project
				})
			})
		}
	}, [submissionList, projectId, objectName, setSelectedProjects, type])

	return (
		<div>
			<div className="content-row">
				{type === "checkbox" &&
					<input
						type="checkbox"
						checked={submissionList.some(sub => sub.selected)}
						onChange={handleCheckboxChange}
					/>
				}
				{submissions.length > 0 ? (
					<p className='document-info-name' onClick={() => setExpanded(!expanded)}>
						{header} ({submissions.length})
						<img
							className='dropdown-arrow'
							src={arrow}
							alt='dropdown arrow'
							onClick={() => setExpanded(!expanded)}
						/>
					</p>
				) : (
					<p className='document-info-name-grey'>
						{header} ({submissions.length})
						<img
							className='dropdown-arrow'
							src={greyArrow}
							alt='dropdown arrow'
						/>
					</p>
				)
				}
			</div>
			{expanded &&
				<div>
					<ul>
						<div className="preparatory-documents">
							{submissionList.length > 0 ? (
								submissionList.map((submission, index) => (
									<Submission
										type={type}
										key={index}
										submission={submission}
										onSelectionChange={(isSelected) =>
											updateSubmissionSelection(index, isSelected)
										}
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
