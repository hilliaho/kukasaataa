import React from 'react';
import { useState } from 'react';
import PreparatoryDocuments from './PreparatoryDocuments';

const ResultItem = ({ result, isSelected, handleCheckboxChange }) => {
	const [expandedContent, setExpandedContent] = useState(false);

	return (
		<div className='result-item'>
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
				<PreparatoryDocuments submissions={result.lausunnot}/>
			</div>}
		</div>
	);
};

export default ResultItem;