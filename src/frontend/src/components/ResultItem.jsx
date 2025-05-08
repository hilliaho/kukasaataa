import React from 'react';
import { useState } from 'react';
import PreparatoryDocuments from './PreparatoryDocuments';

const ResultItem = ({ result, isSelected, handleCheckboxChange }) => {
	const [expandedContent, setExpandedContent] = useState(false);

	return (
		<div key={result._id} className='project-item'>
			<input
				type="checkbox"
				checked={isSelected}
				onChange={() => handleCheckboxChange(result)}
			/>
			<button className='he-identifier-button' onClick={() => setExpandedContent(!expandedContent)}>{result.heTunnus}</button>
			<div className="download-a">
				<a href={result.heUrl}>{result.heNimi}</a>
			</div>
			{expandedContent && 
			<div className='expanded-content'>
				<h3>Valmisteluasiakirjat</h3>
				<h4>Lausuntokierroksen lausunnot:</h4>
				<PreparatoryDocuments submissions={result.dokumentit.lausunnot} name={"lausunnot"} />
				<h4>Asiantuntijalausunnot</h4>
				<PreparatoryDocuments submissions={result.dokumentit.asiantuntijalausunnot} name={"asiantuntijalausunnot"}/>
				<h4>Valiokunta-asiakirjat</h4>
				<PreparatoryDocuments submissions={result.dokumentit.valiokuntaAsiakirjat} name={"valiokunta-asiakirjat"}/>
			</div>}
		</div>
	);
};

export default ResultItem;