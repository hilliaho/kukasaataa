import React from 'react';
import StudentProject from './StudentProject';
const StudentView = ({ projects }) => {

  return (
  <div className='student-view'>
    <h1>Kuka säätää?</h1>
    {projects.map((project) => (
      <div key={project._id} className='student-project'>
        <StudentProject project={project} />
      </div>
    ))}
  </div>);
}

export default StudentView;