import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeView from './views/HomeView';
import ProjectSelectionView from './views/ProjectSelectionView';
import DocumentSelectionView from './views/DocumentSelectionView';
import SummaryView from './views/SummaryView';
import StudentView from './views/StudentView';
import './App.css';


const debugLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

const debugError = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
};

function App() {
  //const API_URL = process.env.REACT_APP_API_URL;
  const API_URL = ''
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [prefetchedPages, setPrefetchedPages] = useState({});
  const [joinCode, setJoinCode] = useState("");
  const [editCode, setEditCode] = useState("");
  const [role, setRole] = useState("student");
  const [studentProjects, setStudentProjects] = useState([]);

  const prefetchedPagesRef = useRef({});


  useEffect(() => {
    if (searchResults.length === 0) {
      fetchTotalCount(searchQuery);
      fetchProjects(1, 10, searchQuery);
    }
  }, [searchQuery, searchResults.length]);

  const fetchTotalCount = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects/count?search_query=${searchQuery}`);
      const data = await response.json();
      debugLog("Total search results: ", data.count);
      setTotalSearchResults(data.count);
      return data.count;
    } catch (error) {
      debugError("Error fetching total count:", error);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (page, perPage, searchQuery) => {
    debugLog(`Haetaan projekteja ${perPage} kpl sivulta ${page} hakusanalla "${searchQuery}"`);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects?page=${page}&per_page=${perPage}&search_query=${searchQuery}`);
      const data = await response.json();
      const normalizedData = data.map((item) => ({
        ...item,
        dokumentit: item.dokumentit ?? {},
      }));

      setSearchResults(normalizedData);
      debugLog("Projects fetched:", data.map((project) => project.heTunnus));
    } catch (error) {
      debugError("Error fetching projects:", error);
    } finally {
      prefetchedPagesRef.current = {};
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNextPages = async () => {
      const pagesToPrefetch = [currentPage + 1, currentPage + 2];

      for (const page of pagesToPrefetch) {
        if (!prefetchedPagesRef.current[page]) {
          try {
            const response = await fetch(`${API_URL}/projects?page=${page}&per_page=${resultsPerPage}&search_query=${searchQuery}`);
            const data = await response.json();
            const normalizedData = data.map((item) => ({
              ...item,
              dokumentit: item.dokumentit ?? {},
            }));
            prefetchedPagesRef.current[page] = normalizedData;
            debugLog(`Prefetched page ${page}`, data);
          } catch (error) {
            debugError(`Error prefetching page ${page}:`, error);
          }
        }
      }
    };

    fetchNextPages();
  }, [currentPage, resultsPerPage, searchQuery]);
  const handleSearch = (query) => {
    setSearchResults([]);
    setPrefetchedPages({});
    setTotalSearchResults(0);
    fetchTotalCount(searchQuery).then((count) => {
      if (count > 0) {
        fetchProjects(1, resultsPerPage, query);
      }
    });
  };

  const handleCheckboxChange = (project) => {
    setSelectedProjects((prevSelected) => {
      const isSelected = prevSelected.some((p) => p._id === project._id);
      if (isSelected) {
        return prevSelected.filter((p) => p._id !== project._id);
      } else {
        const selectedProject = addSelectedFields(project);
        return [...prevSelected, selectedProject];
      }
    });
  };

  const addSelectedFields = (project) => {
    if (!project.dokumentit) {
      project.dokumentit = {};
    }

    if (Array.isArray(project.dokumentit.lausunnot)) {
      project.dokumentit.lausunnot = project.dokumentit.lausunnot.map((lausunto) => ({
        ...lausunto,
        selected: true,
      }));
    }

    if (Array.isArray(project.dokumentit.asiantuntijalausunnot)) {
      project.dokumentit.asiantuntijalausunnot = project.dokumentit.asiantuntijalausunnot.map((lausunto) => ({
        ...lausunto,
        selected: true,
      }));
    }

    if (Array.isArray(project.dokumentit.valiokunnanLausunnot)) {
      project.dokumentit.valiokunnanLausunnot = project.dokumentit.valiokunnanLausunnot.map((lausunto) => ({
        ...lausunto,
        selected: true,
      }));
    }

    if (Array.isArray(project.dokumentit.valiokunnanMietinnot)) {
      project.dokumentit.valiokunnanMietinnot = project.dokumentit.valiokunnanMietinnot.map((lausunto) => ({
        ...lausunto,
        selected: true,
      }));
    }

    return project;
  };

  const paginate = (pageNumber, perPage) => {
    if (prefetchedPages[pageNumber]) {
      setSearchResults(prefetchedPages[pageNumber]);
    } else {
      fetchProjects(pageNumber, perPage, searchQuery);
    }
    setCurrentPage(pageNumber);
    setResultsPerPage(perPage);
  };

  



  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<HomeView
            API_URL={API_URL}
            setRole={setRole}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            setStudentProjects={setStudentProjects}
            debugError={debugError}
            />} />
          <Route exact path="/select-projects" element={<ProjectSelectionView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            loading={loading}
            selectedProjects={selectedProjects}
            searchResults={searchResults}
            handleCheckboxChange={handleCheckboxChange}
            currentPage={currentPage}
            resultsPerPage={resultsPerPage}
            paginate={paginate}
            totalSearchResults={totalSearchResults}
            setSearchResults={setSearchResults}
            setTotalSearchResults={setTotalSearchResults}
 />} />
          <Route exact path="/select-documents" element={<DocumentSelectionView
            API_URL={API_URL}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            setLoading={setLoading} 
            setEditCode={setEditCode} 
            setJoinCode={setJoinCode} 
            debugLog={debugLog} 
            debugError={debugError}
            />} />
          <Route exact path="/summary" element={<SummaryView joinCode={joinCode}
            editCode={editCode}
            selectedProjects={selectedProjects} />} />
          <Route exact path="/student" element={<StudentView projects={studentProjects} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;