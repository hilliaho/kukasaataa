import React, { useState, useEffect } from "react";
import SearchResults from "./components/SearchResults";
import SearchField from "./components/SearchField";
import BackButton from "./components/BackButton";
import SelectedProjects from "./components/SelectedProjects";
import Pagination from "./components/Pagination";
import Summary from "./components/Summary";
import "./App.css";

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

const Home = () => {
  const API_URL = process.env.REACT_APP_API_URL || '/api';
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [step, setStep] = useState("home");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [prefetchedPages, setPrefetchedPages] = useState({});

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
      setSearchResults(data);
      debugLog("Projects fetched:", data);
    } catch (error) {
      debugError("Error fetching projects:", error);
    } finally {
      setPrefetchedPages({});
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNextPages = async () => {
      const pagesToPrefetch = [currentPage + 1, currentPage + 2];
      for (const page of pagesToPrefetch) {
        if (!prefetchedPages[page]) {
          try {
            const response = await fetch(`${API_URL}/projects?page=${page}&per_page=${resultsPerPage}&search_query=${searchQuery}`);
            const data = await response.json();
            setPrefetchedPages((prev) => ({ ...prev, [page]: data }));
            debugLog(`Prefetched page ${page}`, data);
          } catch (error) {
            debugError(`Error prefetching page ${page}:`, error);
          }
        }
      }
    };

    fetchNextPages();
  }, [currentPage, resultsPerPage, searchQuery, prefetchedPages]);

  const handleSearch = () => {
    setSearchResults([]);
    setPrefetchedPages({});
    setTotalSearchResults(0);
    fetchTotalCount(searchQuery).then((count) => {
      if (count > 0) {
        fetchProjects(1, resultsPerPage, searchQuery);
      }
    });
  };

  const handleBackToHome = () => {
    const confirm = window.confirm("Luotu peli menetetään. Haluatko varmasti palata etusivulle?");
    if (confirm) {
      setStep("home");
    }
  };

  const handleBackToSelection = () => {
    setStep("selection");
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
    project.dokumentit.lausunnot = project.dokumentit.lausunnot.map((lausunto) => ({
      ...lausunto,
      selected: true,
    }));
    project.dokumentit.asiantuntijalausunnot = project.dokumentit.asiantuntijalausunnot.map((lausunto) => ({
      ...lausunto,
      selected: true,
    }));
    project.dokumentit.valiokuntaAsiakirjat = project.dokumentit.valiokuntaAsiakirjat.map((lausunto) => ({
      ...lausunto,
      selected: true,
    }));
    return project;
  };

  const handleSaveAndContinue = () => {
    setStep("summary");
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
    <div>
      {step === "home" && (
        <div className="center-container">
          <h1>Kuka säätää?</h1>
          <button onClick={() => setStep("selection")} style={{ marginTop: "50px" }}>
            Luo uusi peli
          </button>
        </div>
      )}
      {step === "selection" && (
        <>
          <div className="back-button">
            <BackButton handleFunction={handleBackToHome} />
          </div>
          <div className="center-container">
            <SearchField
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
            />
            {loading && <p>Ladataan hankkeita...</p>}
            {searchResults.length > 0 && (
              <>
                <SelectedProjects
                  selectedProjects={selectedProjects}
                  projects={searchResults}
                  handleCheckboxChange={handleCheckboxChange}
                />
                <SearchResults
                  results={searchResults}
                  selectedProjects={selectedProjects}
                  handleCheckboxChange={handleCheckboxChange}
                  searchQuery={searchQuery}
                />
                <Pagination
                  currentPage={currentPage}
                  resultsPerPage={resultsPerPage}
                  paginate={paginate}
                  totalSearchResults={totalSearchResults}
                />
              </>
            )}
            {!loading && searchResults.length === 0 && totalSearchResults === 0 && (
              <p>Ei hakutuloksia hakusanalla {searchQuery}</p>
            )}
          </div>
          <button className="continue-button" onClick={handleSaveAndContinue}>
            Tallenna ja siirry eteenpäin
          </button>
        </>
      )}
      {step === "summary" && (
        <>
          <div className="back-button">
            <BackButton handleFunction={handleBackToSelection} />
          </div>
          <Summary selectedProjects={selectedProjects} />
        </>
      )}
    </div>
  );
};

export default Home;
