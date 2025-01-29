import Submission from "./Submission"

const PreparatoryDocuments = ({submissions}) => {
	return(
		<div className="preparatory-documents">
			<h3>Valmisteluasiakirjat</h3>
			<h4>Lausunnot:</h4>
			{submissions ? (submissions.map((submission, index) =>
				<Submission key={index} name={submission.nimi} url={submission.url}/>
			)) :(<p>Ei lausuntoja.</p>)}
		</div>
	)
}

export default PreparatoryDocuments