const Submission = ({name, type, url}) => {
	return (
		<div className="submission">
			<a href={url}>{type}: {name}</a>
		</div>
	)
}

export default Submission