import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";

const UserRoute = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // Check role === "normal" (not "user")
  if (!isAuthenticated || user?.role !== "normal") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default UserRoute;
