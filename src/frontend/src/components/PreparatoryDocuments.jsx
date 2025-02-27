
const PreparatoryDocuments = ({ submissions }) => {
	return (
		<div className="preparatory-documents">
			{submissions ? (submissions.map((submission, index) =>
				<div key={index} className="submission">
					{submission.asiakirjatyyppi ? (
						<a href={submission.url}>
							{submission.asiakirjatyyppi}: {submission.nimi}
						</a>
					) : (
						<a href={submission.url}>{submission.nimi}</a>
					)}
				</div>
			)) : (<p>Ei lausuntoja.</p>)}
		</div>
	)
}

export default PreparatoryDocuments