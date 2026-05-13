import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
//guardrail component that checks if the user is authenticated and has the required role before allowing access to certain routes.
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }
  if (!user) {
    // authentication check: not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // authentication check: logged in but wrong role → redirect to home
    return <Navigate to="/" replace />;
  }
  //renders the childern components if user is logged in and has the requiredrole
  return children;
}

export default ProtectedRoute;
