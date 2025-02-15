import React from 'react'
import { useState } from 'react'
import arrow from '../assets/dropdown-arrow.png'
import PreparatoryDocuments from './PreparatoryDocuments';


const DocumentInfo = ({name, documentList}) => {
	const [expanded, setExpanded] = useState(false)

	return (
		<div>
			<p className='document-info-name' onClick={() => setExpanded(!expanded)}>
			{name} ({documentList.length}) 
			<img 
			className='dropdown-arrow' 
			src={arrow} 
			alt='dropdown arrow'
			onClick={() => setExpanded(!expanded)}
			/>
			</p>
			{expanded && 
			<div>
				<ul>
				<PreparatoryDocuments submissions={documentList} />
				</ul>
			</div>
			}
		</div>
	)
}

export default DocumentInfo