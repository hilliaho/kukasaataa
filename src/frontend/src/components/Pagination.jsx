const Pagination = ({ currentPage, paginate, totalSearchResults }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalSearchResults / 10);
  const maxVisiblePages = 3;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);

    if (currentPage > maxVisiblePages + 2) {
      pageNumbers.push("...");
    }

    const startPage = Math.max(2, currentPage - maxVisiblePages);
    const endPage = Math.min(totalPages - 1, currentPage + maxVisiblePages);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (currentPage < totalPages - maxVisiblePages - 1) {
      pageNumbers.push("...");
    }

    pageNumbers.push(totalPages);
  }

  return (
    <div>
      <nav className="pagination">
        {pageNumbers.map((number, index) => (
          <button
            key={index}
            className={`pagination-button ${currentPage === number ? "active" : ""}`}
            onClick={() => typeof number === "number" && paginate(number)}
            disabled={typeof number !== "number"}
          >
            {number}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Pagination;
