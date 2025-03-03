import React from "react";
import ResultItem from "./ResultItem";

const SelectedProjects = ({ selectedProjects, projects, handleCheckboxChange }) => {
    return (
        <div className="project-container">
        <h2>Valitut hankkeet</h2>
        <ul>
            {selectedProjects.length === 0 ? (
            <p>Ei valittuja hankkeita</p>
            ) : (
            selectedProjects.map((project, index) => (
                <div key={index}><ResultItem
                key={project.id}
                result={project}
                isSelected={true}
                handleCheckboxChange={handleCheckboxChange}/>
                </div>
            ))
            )}
        </ul>
        </div>
    );
    }

export default SelectedProjects;