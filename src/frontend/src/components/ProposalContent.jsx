import React from "react";

const ProposalContent = ({ url, content }) => {
	return (
		<div>
			<div className="download-a">
				<a href={url}>Lataa pdf</a>
			</div>
			<div className="proposal-content">{content}</div>
		</div>
	)
}

export default ProposalContent;