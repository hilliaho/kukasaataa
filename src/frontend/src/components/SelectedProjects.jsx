import React from "react";
import Project from "./Project";

const SelectedProjects = ({ selectedProjects, setSelectedProjects }) => {
    return (
        <div className="project-container">
            <h2>Valitut hankkeet</h2>
            <ul>
                {selectedProjects.length === 0 ? (
                    <p>Ei valittuja hankkeita</p>
                ) : (
                    selectedProjects.map((project, index) => (
                        <div key={index}>
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