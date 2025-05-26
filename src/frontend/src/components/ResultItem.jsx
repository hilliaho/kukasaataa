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
				<PreparatoryDocuments submissions={result.dokumentit.lausunnot} name={"Lausunnot"} />
				<h4>Asiantuntijalausunnot</h4>
				<PreparatoryDocuments submissions={result.dokumentit.asiantuntijalausunnot} name={"Asiantuntijalausunnot"}/>
				<h4>Valiokunnan lausunnot</h4>
				<PreparatoryDocuments submissions={result.dokumentit.valiokunnanLausunnot} name={"Valiokunnan lausunnot"}/>
				<h4>Valiokunnan mietinnöt</h4>
				<PreparatoryDocuments submissions={result.dokumentit.valiokunnanMietinnot} name={"Valiokunnan mietinnöt"}/>
			</div>}
		</div>
	);
};

export default ResultItem;