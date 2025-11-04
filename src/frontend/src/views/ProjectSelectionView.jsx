import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import SearchField from "../components/SearchField";
import SelectedProjects from "../components/SelectedProjects";
import SearchResults from "../components/SearchResults";
import Pagination from "../components/Pagination";

const ProjectSelectionView = ({ API_URL, joinCode, setJoinCode, searchQuery, setSearchQuery, selectedProjects, searchResults,
  totalSearchResults,
  setSearchResults, setTotalSearchResults, fetchProjects, setSelectedProjects, fetchTotalCount, prefetchedPagesRef, debugLog, debugError
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const editCode = location.pathname.split("/")[1]


  useEffect(() => {
    if (!joinCode || !selectedProjects) {
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
            debugLog(`[ProjectSelectionView] Prefetched page ${page}`, data);
          } catch (error) {
            debugError(`Error prefetching page ${page}:`, error);
          }
        }
      }
    };

    fetchNextPages();
  }, [API_URL, currentPage, debugError, debugLog, joinCode, navigate, prefetchedPagesRef, searchQuery, selectedProjects]);

  const handleBackToHome = () => {
    if (window.confirm("Tehdyt valinnat menetetään, haluatko varmasti palata etusivulle?")) {
      setJoinCode('')
      setSelectedProjects([])
      navigate('/')
    }
  }

  const handleContinue = () => {
    navigate(`/${editCode}/select-documents`)
  }

  const handleSearch = (query) => {
    setLoading(true)
    setSearchResults([]);
    prefetchedPagesRef.current = []
    setTotalSearchResults(0);
    fetchTotalCount(searchQuery).then((count) => {
      if (count > 0) {
        fetchProjects(1, query);
      }
    });
    setLoading(false)
  };

  const paginate = (pageNumber) => {
    if (prefetchedPagesRef.current[pageNumber]) {
      let onePageResults = prefetchedPagesRef.current[pageNumber]
      onePageResults = onePageResults.filter((p) => !selectedProjects.map((p)=>p._id).includes(p._id))
      setSearchResults(onePageResults);
    } else {
      fetchProjects(pageNumber, searchQuery);
    }
    setCurrentPage(pageNumber);
  };


  return (
    <>
      <BackButton handleFunction={handleBackToHome} />
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
            setSelectedProjects={setSelectedProjects}
          />
          <SearchResults
            results={searchResults}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
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