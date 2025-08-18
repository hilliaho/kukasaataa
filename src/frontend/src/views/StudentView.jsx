import React from 'react';
import { useState, useEffect } from 'react';
import StudentProject from '../components/StudentProject';
import { useLocation } from 'react-router-dom';

const StudentView = ({ API_URL, debugError }) => {
  const [projects, setProjects] = useState([])
  const location = useLocation()

  useEffect(() => {
    const fetchStudentProjects = async () => {
      const joinCode = location.pathname.split("/")[2]
      console.log('joincode: ', joinCode)
      try {
        const res = await fetch(`${API_URL}/selections/${joinCode}`);
        const data = await res.json();
        if (data) {
          console.log("Oppilaan data:", data);
          setProjects(data.documents);
        } else {
          alert("Koodilla ei löytynyt dokumentteja.");
        }
      } catch (error) {
        debugError("Virhe haettaessa oppilaan näkymän projekteja:", error);
        alert("Jokin meni pieleen. Yritä uudelleen.");
      }
    }
    fetchStudentProjects()


  }, [API_URL, debugError])

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