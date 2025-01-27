import React from 'react';
import { useState } from 'react';
import ProposalContent from './ProposalContent';

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
            {expandedContent && <ProposalContent url={result.proposalUrl} content={result.proposalContent} />}
        </div>
    );
};

export default ResultItem;