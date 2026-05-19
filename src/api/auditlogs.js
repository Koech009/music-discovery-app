import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api/admin/audit`;

export async function getAuditLogs(page = 1, perPage = 20) {
  try {
    const res = await axios.get(`${API_BASE}/`, {
      params: { page, per_page: perPage },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch audit logs");
  }
}

export async function getAuditLogsByUser(userId, page = 1, perPage = 20) {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`, {
      params: { page, per_page: perPage },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch user logs");
  }
}
