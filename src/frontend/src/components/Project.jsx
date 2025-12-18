import { useState, useContext } from 'react';
import LanguageContext from "../LanguageContext"
import DocumentInfo from './DocumentInfo';
import arrow from '../assets/dropdown-arrow.png'

const Project = ({ step, project, selectedProjects, setSelectedProjects }) => {
	const [expandedContent, setExpandedContent] = useState(false);
	const isSelected = step === "student" ? true : selectedProjects.some(p => p._id === project._id)
	const type = step === "document selection" ? "checkbox" : "link"
	const { language, texts } = useContext(LanguageContext)
	const t = texts.project

	const countDocuments = () => {
		const docs = project.dokumentit
		let documentCount = 0
		if (step === "summary" || step === "student") {
			Object.values(docs).forEach((docList) => documentCount = documentCount + docList.filter((doc) => doc.selected).length)
		} else {
			Object.values(docs).forEach((docList) => documentCount = documentCount + docList.length)
		}
		return documentCount
	}

	const documentCount = countDocuments()

	const handleCheckboxChange = (project) => {
		setSelectedProjects((prevSelected) => {
			const selected = prevSelected.some((p) => p._id === project._id);
			if (selected) {
				return prevSelected.filter((p) => p._id !== project._id);
			} else {
				const selectedProject = addSelectedFields(project);
				return [...prevSelected, selectedProject];
			}
		});
	};


	const addSelectedFields = (project) => {
		if (!project.dokumentit) {
			project.dokumentit = {};
		}

		if (Array.isArray(project.dokumentit.heLuonnokset)) {
			project.dokumentit.heLuonnokset = project.dokumentit.heLuonnokset.map((lausunto) => ({
				...lausunto,
				selected: true,
			}));
		}

		if (Array.isArray(project.dokumentit.lausuntokierroksenLausunnot)) {
			project.dokumentit.lausuntokierroksenLausunnot = project.dokumentit.lausuntokierroksenLausunnot.map((lausunto) => ({
				...lausunto,
				selected: true,
			}));
		}

		if (Array.isArray(project.dokumentit.asiantuntijalausunnot)) {
			project.dokumentit.asiantuntijalausunnot = project.dokumentit.asiantuntijalausunnot.map((lausunto) => ({
				...lausunto,
				selected: true,
			}));
		}

		if (Array.isArray(project.dokumentit.valiokunnanLausunnot)) {
			project.dokumentit.valiokunnanLausunnot = project.dokumentit.valiokunnanLausunnot.map((lausunto) => ({
				...lausunto,
				selected: true,
			}));
		}

		if (Array.isArray(project.dokumentit.valiokunnanMietinnot)) {
			project.dokumentit.valiokunnanMietinnot = project.dokumentit.valiokunnanMietinnot.map((lausunto) => ({
				...lausunto,
				selected: true,
			}));
		}

		return project;
	};


	return (
		<div key={project._id} className='project-item'>
			{step === "project selection" &&
				<input
					type="checkbox"
					checked={isSelected}
					onChange={() => handleCheckboxChange(project)}
				/>
			}
			{project.heTunnus && project.vuosi && project.numero && <strong>{t.code} {project.vuosi}/{project.numero}</strong>}
			{!project.heTunnus && <strong>{project.valmistelutunnus}</strong>}
			{project.heNimi &&
				<div>
					{<a className='document-a' href={project["heUrl"][`${language[0]}`]} target='_blank' rel='noopener noreferrer'>{project["heNimi"][`${language[0]}`] || project["heNimi"][`${language[1]}`]}</a>}
				</div>}
			<p className='document-category-name-p' onClick={() => setExpandedContent(!expandedContent)}>
				{t.documents} ({documentCount})
				<img
					className='dropdown-arrow'
					src={arrow}
					alt='dropdown arrow'
					onClick={() => setExpandedContent(!expandedContent)}
				/>
			</p>
			{expandedContent &&
				<div className='expanded-content'>
					{(step === "summary" || step === "student") &&
						<div>
							{<DocumentInfo type={type} projectId={project._id} objectName={"heLuonnokset"} header={t.headers[0]} submissions={project.dokumentit.heLuonnokset.filter((submission) => submission.selected)} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"lausuntokierroksenLausunnot"} header={t.headers[1]} submissions={project.dokumentit.lausuntokierroksenLausunnot.filter((submission) => submission.selected)} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"asiantuntijalausunnot"} header={t.headers[2]} submissions={project.dokumentit.asiantuntijalausunnot.filter((submission) => submission.selected)} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"valiokunnanLausunnot"} header={t.headers[3]} submissions={project.dokumentit.valiokunnanLausunnot.filter((submission) => submission.selected)} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"valiokunnanMietinnot"} header={t.headers[4]} submissions={project.dokumentit.valiokunnanMietinnot.filter((submission) => submission.selected)} />}
						</div>}
					{(step === "project selection" || step === "document selection") &&
						<div>
							{<DocumentInfo type={type} projectId={project._id} objectName={"heLuonnokset"} header={t.headers[0]} submissions={project.dokumentit.heLuonnokset ?? []} setSelectedProjects={setSelectedProjects} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"lausuntokierroksenLausunnot"} header={t.headers[1]} submissions={project.dokumentit.lausuntokierroksenLausunnot ?? []} setSelectedProjects={setSelectedProjects} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"asiantuntijalausunnot"} header={t.headers[2]} submissions={project.dokumentit.asiantuntijalausunnot ?? []} setSelectedProjects={setSelectedProjects} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"valiokunnanLausunnot"} header={t.headers[3]} submissions={project.dokumentit.valiokunnanLausunnot ?? []} setSelectedProjects={setSelectedProjects} />}
							{<DocumentInfo type={type} projectId={project._id} objectName={"valiokunnanMietinnot"} header={t.headers[4]} submissions={project.dokumentit.valiokunnanMietinnot ?? []} setSelectedProjects={setSelectedProjects} />}
						</div>}
				</div>}
		</div>
	);
};

export default Project;