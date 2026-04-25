import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== "admin") return <Navigate to="/projects" replace />;
  return children;
}
