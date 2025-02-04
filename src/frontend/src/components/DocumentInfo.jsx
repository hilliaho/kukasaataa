const DocumentInfo = ({name, documentList}) => {
	return (
		<div>
			<p>
			{name} ({documentList.length})
			</p>
		</div>
	)
}

export default DocumentInfo