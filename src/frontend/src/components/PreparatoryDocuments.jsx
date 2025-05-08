import React, { useState } from 'react'
import arrow from '../assets/dropdown-arrow.png'


const PreparatoryDocuments = ({ submissions = [], name }) => {
	const [expanded, setExpanded] = useState(false)
	return (
		<div className="preparatory-documents">
			<div className="content-row">
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
							{submissions.length > 0 ? (
								submissions.map((submission) => (
									<div>
									{submission.asiakirjatyyppi ? (
										<a href={submission.url}>
											{submission.asiakirjatyyppi}: {submission.nimi}
										</a>
									) : (
										<a href={submission.url}>{submission.nimi}</a>
									)}
									</div>
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

export default PreparatoryDocuments