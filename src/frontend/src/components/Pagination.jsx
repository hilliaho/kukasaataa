const Pagination = ({ currentPage, resultsPerPage, paginate, totalSearchResults }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalSearchResults / resultsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <p>Page Numbers:</p>
      <nav className="pagination">
        {pageNumbers.map((number) => (
            <button key={number} className={`page-item ${currentPage === number ? "active" : ""}`} onClick={() => paginate(number, resultsPerPage)}>
              {number}
            </button>
        ))}
			</nav>
    </div>
  );
};

export default Pagination;
