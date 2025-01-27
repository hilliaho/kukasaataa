import React, { useState, useEffect } from "react";
import SearchResults from "./components/SearchResults";
import SearchField from "./components/SearchField";
import BackButton from "./components/BackButton";
import SelectedProjects from "./components/SelectedProjects";
import Pagination from "./components/Pagination";
import "./App.css";


const Home = () => {
  const [gameCode, setGameCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [step, setStep] = useState("home");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalSearchResults, setTotalSearchResults] = useState(30)
  const [prefetchedPages, setPrefetchedPages] = useState({})

  useEffect(() => {
    if (projects.length > 0) {
      const fetchNextPages = async () => {
        const pagesToPrefetch = [currentPage + 1, currentPage + 2];
        for (const page of pagesToPrefetch) {
          if (!prefetchedPages[page]) {
            try {
              const response = await fetch(`/api/projects?page=${page}&per_page=${resultsPerPage}`);
              const data = await response.json();
              setPrefetchedPages((prev) => ({ ...prev, [page]: data }));
              console.log(`Prefetched page ${page}:`, data);
            } catch (error) {
              console.error(`Error prefetching page ${page}:`, error);
            }
          }
        }
      };
      fetchNextPages();
    }
  }, [projects, currentPage, resultsPerPage, prefetchedPages]);
  
  

  const fetchProjects = async (page, perPage) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects?page=${page}&per_page=${perPage}`);
      const data = await response.json();
      setProjects(data);
      setSearchResults(data);
      console.log("Projects fetched:", data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    setLoading(false)
  };

  const handleBackToHome = () => {
    const confirm = window.confirm(
      "Luotu peli menetetään. Haluatko varmasti palata etusivulle?"
    );
    if (confirm) {
      setGameCode("");
      setStep("home");
    }
  };

  const handleBackToSelection = () => {
    setStep("selection");
  };

  const handleSearch = () => {
    console.log("projects:", projects);
    const results = projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    console.log("Search results:", results);
  };

  const handleCheckboxChange = (id) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter((result) => result !== id));
    } else {
      setSelectedProjects([...selectedProjects, id]);
    }
  };

  const handleSaveAndContinue = () => {
    console.log("Tallennetaan ja siirrytään eteenpäin");
    setStep("summary");
  };

  const paginate = (pageNumber, perPage) => {
    if (prefetchedPages[pageNumber]) {
      setProjects(prefetchedPages[pageNumber]);
      setSearchResults(prefetchedPages[pageNumber]);
    } else {
      fetchProjects(pageNumber, perPage)
    }
    setCurrentPage(pageNumber);
    setResultsPerPage(perPage)
  }

  return (
    <div>
      {step === "home" && (
        <>
          <div className="center-container">
            <h1>Kuka säätää?</h1>
            <button
              onClick={() => setStep("selection")}
              style={{ marginTop: "50px" }}
            >
              Luo uusi peli
            </button>
          </div>
        </>
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
            {loading ? (<p>Ladataan hankkeita...</p>) : (<p></p>)}
            {projects.length > 0 ? (
              <>
                <SelectedProjects
                  selectedProjects={selectedProjects}
                  projects={projects}
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
            ) : (<button onClick={() => fetchProjects(currentPage, resultsPerPage)}>Lataa hankkeet</button>)}
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
          <div className="center-container">
            <h1>Yhteenveto</h1>
            <p>Valitut hankkeet:</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
