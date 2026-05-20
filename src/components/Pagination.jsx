import "../styles/pagination.css";

export default function Pagination({ metadata, onPageChange, perPage }) {
  if (!metadata || metadata.total_pages <= 1) return null;

  const { current_page, total_pages, has_next, has_prev, total } = metadata;

  // Build page number array with ellipsis e.g. [1, '...', 4, 5, 6, '...', 12]
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; 
    const left = current_page - delta;
    const right = current_page + delta;

    for (let i = 1; i <= total_pages; i++) {
      if (
        i === 1 ||
        i === total_pages ||
        (i >= left && i <= right)
      ) {
        pages.push(i);
      }
    }

    // Insert ellipsis where gaps exist
    const withEllipsis = [];
    let prev = null;
    for (const page of pages) {
      if (prev !== null && page - prev > 1) {
        withEllipsis.push("...");
      }
      withEllipsis.push(page);
      prev = page;
    }

    return withEllipsis;
  };

  const from = perPage ? (current_page - 1) * perPage + 1 : null;
  const to = perPage ? Math.min(current_page * perPage, total) : null;

  return (
    <div className="pagination-wrapper">
      <div className="pagination-controls">
        {/* Prev */}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(current_page - 1)}
          disabled={!has_prev}
        >
          ← Prev
        </button>

        {/* Page numbers */}
        <div className="pagination-page-numbers">
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                key={p}
                className={`pagination-btn ${p === current_page ? "active" : ""}`}
                onClick={() => p !== current_page && onPageChange(p)}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(current_page + 1)}
          disabled={!has_next}
        >
          Next →
        </button>
      </div>

      {/* Range info */}
      {perPage && total && (
        <p className="pagination-info">
          Showing {from}–{to} of {total}
        </p>
      )}
    </div>
  );
}