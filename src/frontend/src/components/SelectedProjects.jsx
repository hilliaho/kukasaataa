import { useContext } from "react";
import Project from "./Project";
import LanguageContext from "../LanguageContext";

const SelectedProjects = ({ selectedProjects, setSelectedProjects }) => {
    const { texts } = useContext(LanguageContext)
    const t = texts.selectedProjects

    return (
        <div className="project-container">
            <h3>{t.selectedProjects}</h3>
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