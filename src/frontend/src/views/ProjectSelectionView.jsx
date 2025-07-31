import React from "react"
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import SearchField from "../components/SearchField";
import SelectedProjects from "../components/SelectedProjects";
import SearchResults from "../components/SearchResults";
import Pagination from "../components/Pagination";

const ProjectSelectionView = ({ searchQuery, setSearchQuery, handleSearch, loading, selectedProjects, searchResults,
  handleCheckboxChange, currentPage, resultsPerPage, paginate, totalSearchResults,
  setSearchResults, setTotalSearchResults
}) => {
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate('/')
  }

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
            resultsPerPage={resultsPerPage}
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
      <button className="continue-button" onClick={()=>navigate('/select-documents')}>
        Tallenna ja siirry eteenpäin
      </button>
    </>
  )
}

export default ProjectSelectionView