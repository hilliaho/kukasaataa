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
  const API_URL = process.env.REACT_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [joinCode, setJoinCode] = useState('')

  const prefetchedPagesRef = useRef({});


  useEffect(() => {
    if (searchResults.length === 0) {
      fetchTotalCount(searchQuery);
      fetchProjects(1, searchQuery);
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

  const fetchProjects = async (page, searchQuery) => {
    debugLog(`Haetaan projekteja sivulta ${page} hakusanalla "${searchQuery}"`);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects?page=${page}&per_page=10&search_query=${searchQuery}`);
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

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={
            <HomeView
              API_URL={API_URL}
              debugLog={debugLog}
              debugError={debugError}
              joinCode={joinCode}
              setJoinCode={setJoinCode}
              setSelectedProjects={setSelectedProjects}
            />} />
          <Route exact path="/:editCode/select-projects" element={
            <ProjectSelectionView
              API_URL={API_URL}
              joinCode={joinCode}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
              selectedProjects={selectedProjects}
              setSelectedProjects={setSelectedProjects}
              searchResults={searchResults}
              totalSearchResults={totalSearchResults}
              setSearchResults={setSearchResults}
              setTotalSearchResults={setTotalSearchResults}
              fetchProjects={fetchProjects}
              fetchTotalCount={fetchTotalCount}
              prefetchedPagesRef={prefetchedPagesRef}
              debugLog={debugLog}
              debugError={debugError}
            />} />
          <Route exact path="/:editCode/select-documents" element={
            <DocumentSelectionView
              API_URL={API_URL}
              selectedProjects={selectedProjects}
              setSelectedProjects={setSelectedProjects}
              setLoading={setLoading}
              joinCode={joinCode}
              debugLog={debugLog}
              debugError={debugError}
            />} />
          <Route exact path="/:editCode/summary" element={
            <SummaryView
              joinCode={joinCode}
              selectedProjects={selectedProjects} />} />
          <Route exact path="/student/:joinCode" element={
            <StudentView
              API_URL={API_URL}
              debugLog={debugLog}
              debugError={debugError}
            />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;