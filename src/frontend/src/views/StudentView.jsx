import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Project from '../components/Project';
import groupWorkImg from '../assets/group-work.webp'

const StudentView = ({ API_URL, debugLog, debugError }) => {
  const [projects, setProjects] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudentProjects = async () => {
      const joinCode = location.pathname.split("/")[2]
      debugLog('joincode: ', joinCode)
      try {
        const res = await fetch(`${API_URL}/selections/join/${joinCode}`);
        const data = await res.json();
        if (data) {
          debugLog("[StudentView]: Oppilaan data:", data);
          setProjects(data.documents);
        } else {
          alert("Koodilla ei löytynyt dokumentteja.");
        }
      } catch (error) {
        debugError("[StudentView]: Virhe haettaessa oppilaan näkymän projekteja:", error);
        navigate("/")
        alert("Jokin meni pieleen. Yritä uudelleen.");
      }
    }
    fetchStudentProjects()


  }, [API_URL, debugError, debugLog, location.pathname, navigate])

  return (
    <div className='student-view'>
      <h1>Kuka säätää?</h1>
      <img className='group-image' src={groupWorkImg} alt='Ryhmä opiskelijoita keskustelemassa ja työskentelemässä'/>
      {projects.map((project) => (
        <div key={project._id} className='student-project'>
          <Project step={"student"} project={project} />
        </div>
      ))}
    </div>);
}

export default StudentView;