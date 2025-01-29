/*
1. Käyttäjä avaa sivun
2. effect: sovellus lataa tulosten kokonaismäärän tyhjällä hakusanalla ja tekee sivutuksen
3. effect: sovellus lataa ensimmäisen sivun sisällön
4. effect: sovellus lataa n kpl seuraavia sivuja
*/



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
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalSearchResults, setTotalSearchResults] = useState(0)
  const [prefetchedPages, setPrefetchedPages] = useState({})

  useEffect(() => {
    if (searchResults.length === 0) {
      fetchTotalCount(searchQuery)
      fetchProjects(1, 10, searchQuery)
    }
    }, [searchQuery, searchResults.length]);

  const fetchTotalCount = async (searchQuery) => {
    console.log("fetch total count")
    setLoading(true)
    const response = await fetch(`/api/projects/count?search_query=${searchQuery}`)
    const data = await response.json()
    console.log("Total search results: ", data.count)
    setTotalSearchResults(data.count)
    setLoading(false)
    return data.count
  }
  
  const fetchProjects = async (page, perPage, searchQuery) => {
    console.log(`haetaan projekteja ${perPage} kpl sivulta ${page} hakusanalla ${searchQuery}`)
    setLoading(true)
    try {
      const response = await fetch(`/api/projects?page=${page}&per_page=${perPage}&search_query=${searchQuery}`);
      const data = await response.json();
      console.log(data)
      setSearchResults(data);
      console.log("Projects fetched:", data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    setPrefetchedPages({})
    setLoading(false)
  };

  useEffect(() => {
    const fetchNextPages = async () => {
      const pagesToPrefetch = [currentPage + 1, currentPage + 2];
      for (const page of pagesToPrefetch) {
        if (!prefetchedPages[page]) {
          try {
            const response = await fetch(`/api/projects?page=${page}&per_page=${resultsPerPage}&search_query=${searchQuery}`);
            const data = await response.json();
            setPrefetchedPages((prev) => ({ ...prev, [page]: data }));
          } catch (error) {
            console.error(`Error prefetching page ${page}:`, error);
          }
        }
      }
    };

    fetchNextPages();
  }, [currentPage, resultsPerPage, searchQuery, prefetchedPages]);

  const handleSearch = () => {
    setSearchResults([])
    setPrefetchedPages({})
    setTotalSearchResults(0)
    const count = fetchTotalCount(searchQuery)
    if (count > 0) {
      fetchProjects(1, resultsPerPage, searchQuery)
    }
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
      setSearchResults(prefetchedPages[pageNumber]);
    } else {
      fetchProjects(pageNumber, perPage, searchQuery)
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
            {loading && (<p>Ladataan hankkeita...</p>)}
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
            {!loading && searchResults.length === 0 && totalSearchResults === 0 && <p>Ei hakutuloksia hakusanalla {searchQuery}</p>}
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
