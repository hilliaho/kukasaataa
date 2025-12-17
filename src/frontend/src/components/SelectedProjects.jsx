import { useContext } from "react";
import Project from "./Project";
import LanguageContext from "../LanguageContext";

const SelectedProjects = ({ selectedProjects, setSelectedProjects }) => {
    const { texts } = useContext(LanguageContext)
    const t = texts.selectedProjects

    return (
        <div className="project-container">
            <h2>{t.selectedProjects}</h2>
            <ul>
                {selectedProjects.length === 0 ? (
                    <p>{t.noSelectedProjects}</p>
                ) : (
                    selectedProjects.map((project, index) => (
                        <div className='project-container' key={index}>
                            <Project
                                step={"project selection"}
                                project={project}
                                selectedProjects={selectedProjects}
                                setSelectedProjects={setSelectedProjects}
                            />
                        </div>
                    ))
                )}
            </ul>
        </div>
    );
}

export default SelectedProjects;