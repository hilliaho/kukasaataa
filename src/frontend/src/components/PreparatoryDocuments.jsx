import Submission from "./Submission"

const PreparatoryDocuments = ({submissions}) => {
	return(
		<div className="preparatory-documents">
			{submissions ? (submissions.map((submission, index) =>
				<Submission key={index} name={submission.nimi} type={submission.asiakirjatyyppi || ""} url={submission.url}/>
			)) :(<p>Ei lausuntoja.</p>)}
		</div>
	)
}

export default PreparatoryDocuments