import React from "react"
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import SearchField from "../components/SearchField";
import SelectedProjects from "../components/SelectedProjects";
import SearchResults from "../components/SearchResults";
import Pagination from "../components/Pagination";

const ProjectSelectionView = ({ API_URL, joinCode, searchQuery, setSearchQuery, selectedProjects, searchResults,
  totalSearchResults,
  setSearchResults, setTotalSearchResults, fetchProjects, setSelectedProjects, fetchTotalCount, prefetchedPagesRef, debugLog, debugError
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [prefetchedPages, setPrefetchedPages] = useState({});
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const editCode = location.pathname.split("/")[1]


  useEffect(() => {
    if(!joinCode || !selectedProjects) {
      navigate(`/`)
    }
    const fetchNextPages = async () => {
      const pagesToPrefetch = [currentPage + 1, currentPage + 2];

      for (const page of pagesToPrefetch) {
        if (!prefetchedPagesRef.current[page]) {
          try {
            const response = await fetch(`${API_URL}/projects?page=${page}&per_page=10&search_query=${searchQuery}`);
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
  }, [API_URL, currentPage, debugError, debugLog, prefetchedPagesRef, searchQuery]);

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleContinue = () => {
    navigate(`/${editCode}/select-documents`)
  }

  const handleSearch = (query) => {
    setLoading(true)
    setSearchResults([]);
    setPrefetchedPages({});
    setTotalSearchResults(0);
    fetchTotalCount(searchQuery).then((count) => {
      if (count > 0) {
        fetchProjects(1, query);
      }
    });
    setLoading(false)
  };

  const paginate = (pageNumber) => {
      if (prefetchedPages[pageNumber]) {
        setSearchResults(prefetchedPages[pageNumber]);
      } else {
        fetchProjects(pageNumber, searchQuery);
      }
      setCurrentPage(pageNumber);
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

  return (
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
            paginate={paginate}
            totalSearchResults={totalSearchResults}
          />
        </>
        {!loading &&
          searchResults.length === 0 &&
          totalSearchResults === 0 && (
            <div>
              <p>Ei hakutuloksia hakusanalla {searchQuery}.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setTotalSearchResults(0);
                }}
                className="reset-search-button"
              >
                Peruuta haku
              </button>
            </div>
          )}
      </div>
      <button className="continue-button" onClick={handleContinue}>
        Tallenna ja siirry eteenpäin
      </button>
    </>
  )
}

export default ProjectSelectionView