import React from "react";
import Project from "./Project";

const SelectedProjects = ({ selectedProjects, setSelectedProjects }) => {
    return (
        <div className="project-container">
            <h3>Valitut hankkeet</h3>
            <ul>
                {selectedProjects.length === 0 ? (
                    <p>Ei valittuja hankkeita</p>
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