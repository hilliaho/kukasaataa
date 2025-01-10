import React from "react";
import ResultItem from "./ResultItem";

const SelectedProjects = ({ selectedProjects, projects, handleCheckboxChange }) => {
    return (
        <div>
        <h2>Valitut hankkeet</h2>
        <ul>
            {selectedProjects.length === 0 ? (
            <p>Ei valittuja hankkeita</p>
            ) : (
            selectedProjects.map((id) => (
                <ResultItem
                key={id}
                result={projects.find((project) => project.id === id)}
                isSelected={true}
                handleCheckboxChange={handleCheckboxChange}/>
            ))
            )}
        </ul>
        </div>
    );
    }

export default SelectedProjects;