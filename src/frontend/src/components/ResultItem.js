import React from 'react';
import { useState } from 'react';
import ProposalContent from './ProposalContent';
import './ResultItem.css'

const ResultItem = ({ result, isSelected, handleCheckboxChange }) => {
    const [expandedContent, setExpandedContent] = useState(false);

    return (
        <div className='result-item'>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(result.id)}
            />
            <button className='he-identifier-button' onClick={() => setExpandedContent(!expandedContent)}>{result.heIdentifier}</button>
            <div>{result.name}</div>
            {result.preparatoryIdentifier ? (<div>{result.preparatoryIdentifier.map((id, index) => (
                <div key={index}>{id}</div>
            ))}</div>) : (null)}
            {expandedContent && <ProposalContent url={result.proposalUrl} content={result.proposalContent} />}
        </div>
    );
};

export default ResultItem;