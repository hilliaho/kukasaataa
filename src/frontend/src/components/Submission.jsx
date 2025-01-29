const Submission = ({name, url}) => {
	return (
		<div className="submission">
			<a href={url}>{name}</a>
		</div>
	)
}

export default Submission