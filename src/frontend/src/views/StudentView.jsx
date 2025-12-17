import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Project from '../components/Project';
import groupWorkImg from '../assets/group-work.webp'
import LanguageContext from '../LanguageContext';


const StudentView = ({ API_URL, debugLog, debugError }) => {
  const [projects, setProjects] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const { texts } = useContext(LanguageContext)
  const t = texts.student

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
          alert(t.wrongCodeNotification);
        }
      } catch (error) {
        debugError("[StudentView]: Virhe haettaessa oppilaan näkymän projekteja:", error);
        navigate("/")
        alert(t.error);
      }
    }
    fetchStudentProjects()


  }, [API_URL, debugError, debugLog, location.pathname, navigate, t.error, t.wrongCodeNotification])

  return (
    <div className='student-view'>
      <img className='group-image' src={groupWorkImg} alt='Ryhmä opiskelijoita keskustelemassa ja työskentelemässä'/>
      {projects.map((project) => (
        <div key={project._id} className='student-project'>
          <Project step={"student"} project={project} />
        </div>
      ))}
    </div>);
}

export default StudentView;