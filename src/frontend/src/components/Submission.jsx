const Submission = ({name, type, url}) => {
	return (
		<div className="submission">
			{type ? (<a href={url}>{type}: {name}</a>):(<a href={url}>{name}</a>)}
		</div>
	)
}

export default Submission