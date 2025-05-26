import React, { useState, useEffect } from "react";
import SearchResults from "./components/SearchResults";
import SearchField from "./components/SearchField";
import BackButton from "./components/BackButton";
import SelectedProjects from "./components/SelectedProjects";
import Pagination from "./components/Pagination";
import Summary from "./components/Summary";
import StudentView from "./components/StudentView";
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
  const API_URL = process.env.REACT_APP_API_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [step, setStep] = useState("home");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [prefetchedPages, setPrefetchedPages] = useState({});
  const [codeNotification, setCodeNotification] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [editCode, setEditCode] = useState("");
  const [role, setRole] = useState("student");
  const [studentProjects, setStudentProjects] = useState([]);

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
            const normalizedData = data.map((item) => ({
              ...item,
              dokumentit: item.dokumentit ?? {},
            }));
            setPrefetchedPages((prev) => ({ ...prev, [page]: normalizedData }));
            debugLog(`Prefetched page ${page}`, data);
          } catch (error) {
            debugError(`Error prefetching page ${page}:`, error);
          }
        }
      }
    };

    fetchNextPages();
  }, [currentPage, resultsPerPage, searchQuery, prefetchedPages]);

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

  const createCode = async () => {
    setLoading(true);
    console.log("Create code: Selected projects:", selectedProjects);

    const generateCode = () => {
      const chars = '123456789';
      let result = '';
      for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const joinCode = generateCode();
    const editCode = generateCode();
    setEditCode(editCode);
    setJoinCode(joinCode);
    setCodeNotification(true);

    const cleanedProjects = selectedProjects
      .map((project) => {
        const cleanedDokumentit = {};

        for (const [key, docs] of Object.entries(project.dokumentit)) {
          if (Array.isArray(docs)) {
            const selectedDocs = docs.filter((doc) => doc.selected);
            if (selectedDocs.length > 0) {
              cleanedDokumentit[key] = selectedDocs;
            }
          }
        }

        const hasSelectedDocuments = Object.values(cleanedDokumentit).some(
          (docs) => docs.length > 0
        );

        if (!hasSelectedDocuments) {
          return null;
        }

        return {
          ...project,
          dokumentit: cleanedDokumentit,
        };
      })
      .filter((p) => p !== null);

    const payload = {
      joinCode,
      editCode,
      documents: cleanedProjects,
    };

    try {
      const response = await fetch(`${API_URL}/selections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      debugLog("Selection: ", payload)
      const data = await response.json();
      debugLog("Code created:", joinCode);
      debugLog("Edit code created:", editCode);
      return data;
    } catch (error) {
      debugError("Error creating code:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleJoinWithCode = async () => {
    try {
      const res = await fetch(`${API_URL}/selections/${joinCode}`);
      const data = await res.json();

      if (data) {
        console.log("Oppilaan data:", data);
        setStudentProjects(data.documents);
        setRole("student");
        setStep("studentView");
      } else {
        alert("Koodilla ei löytynyt dokumentteja.");
      }
    } catch (error) {
      console.error("Virhe liittyessä peliin:", error);
      alert("Jokin meni pieleen. Yritä uudelleen.");
    }
  };




  return (
    <div>
      {step === "home" && (
        <div className="center-container">
          <h1>Kuka säätää?</h1>

          <button
            onClick={() => {
              setRole("teacher");
              setStep("selection");
            }}
            style={{ marginTop: "40px" }}
          >
            Luo uusi peli
          </button>

          <div style={{ marginTop: "60px" }}>
            <h2>Osallistu oppilaana</h2>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Syötä opettajan antama koodi"
              style={{ padding: "10px", fontSize: "16px", marginTop: "10px" }}
            />
            <button
              onClick={handleJoinWithCode}
              style={{ marginTop: "15px" }}
            >
              Liity peliin
            </button>
          </div>
        </div>
      )}

      {role === "student" && step === "studentView" && (
        <div className="center-container">
          <StudentView projects={studentProjects} />
        </div>
      )}



      {role === "teacher" && step === "selection" && (
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
            {!loading &&
              searchResults.length === 0 &&
              totalSearchResults === 0 && (
                <p>Ei hakutuloksia hakusanalla {searchQuery}</p>
              )}
          </div>
          <button className="continue-button" onClick={handleSaveAndContinue}>
            Tallenna ja siirry eteenpäin
          </button>
        </>
      )}

      {role === "teacher" && step === "summary" && (
        <>
          <div className="back-button">
            <BackButton handleFunction={handleBackToSelection} />
          </div>
          <Summary
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
          />
          <div className="code-notification">
            {codeNotification && (
              <div className="code-notification">
                <h3>
                  Materiaalivalinnat tallennettu.
                </h3>
                <p>
                Pelialustan liittymiskoodi: 
                </p>
                <strong>{joinCode}</strong>
                <p>
                Pelialustan muokkaamiskoodi: 
                </p>
                <strong>{editCode}</strong>
              </div>
            )}
          </div>
          {!codeNotification && (
            <button className="continue-button" onClick={createCode}>
              Tallenna valinnat ja luo koodi
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
