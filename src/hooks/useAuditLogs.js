import { useState, useEffect } from "react";
import { getAuditLogs } from "../api/auditlogs";

export default function useAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (currentPage) => {
    setLoading(true);
    try {
      const data = await getAuditLogs(currentPage, perPage);
      setLogs(data.logs);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return { logs, loading, error, page, totalPages, total, perPage, goToPage };
}
