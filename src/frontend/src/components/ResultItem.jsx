import React from 'react';
import { useState } from 'react';
import PreparatoryDocuments from './PreparatoryDocuments';
import arrow from '../assets/dropdown-arrow.png'

const ResultItem = ({ result, isSelected, handleCheckboxChange }) => {
	const [expandedContent, setExpandedContent] = useState(false);

	const countDocuments = () => {
		const docs = result.dokumentit
		let documentCount = 0
		Object.values(docs).forEach((docList) => documentCount = documentCount + docList.length)
		return documentCount
	}

	const documentCount = countDocuments()

	return (
		<div key={result._id} className='project-item'>
			<input
				type="checkbox"
				checked={isSelected}
				onChange={() => handleCheckboxChange(result)}
			/>
			<strong>{result.heTunnus}</strong>
			<div className="download-a">
				<a href={result.heUrl}>{result.heNimi}</a>
			</div>
			<p className='document-info-name' onClick={() => setExpandedContent(!expandedContent)}>
				Valmisteluasiakirjat ({documentCount})
				<img
					className='dropdown-arrow'
					src={arrow}
					alt='dropdown arrow'
					onClick={() => setExpandedContent(!expandedContent)}
				/>
			</p>
			{expandedContent &&
				<div className='expanded-content'>
					<PreparatoryDocuments submissions={result.dokumentit.lausunnot} name={"Lausuntokierroksen lausunnot"} />
					<PreparatoryDocuments submissions={result.dokumentit.asiantuntijalausunnot} name={"Asiantuntijalausunnot"} />
					<PreparatoryDocuments submissions={result.dokumentit.valiokunnanLausunnot} name={"Valiokunnan lausunnot"} />
					<PreparatoryDocuments submissions={result.dokumentit.valiokunnanMietinnot} name={"Valiokunnan mietinnöt"} />
				</div>}
		</div>
	);
};

export default ResultItem;