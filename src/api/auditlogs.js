import api from "../utils/api";

const API_BASE = "/admin/audit";

// Fetch all audit logs (paginated)
export async function getAuditLogs(page = 1, perPage = 20) {
  try {
    const res = await api.get(`${API_BASE}/`, {
      params: { page, per_page: perPage },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch audit logs");
  }
}

// Fetch audit logs by user (paginated)
export async function getAuditLogsByUser(userId, page = 1, perPage = 20) {
  try {
    const res = await api.get(`${API_BASE}/user/${userId}`, {
      params: { page, per_page: perPage },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch user logs");
  }
}

// Fetch audit logs by action type (paginated)
export async function getAuditLogsByAction(action, page = 1, perPage = 20) {
  try {
    const res = await api.get(`${API_BASE}/action/${action}`, {
      params: { page, per_page: perPage },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch action logs");
  }
}
