import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function RoleProtectedRoute({ allowedRoles = [] }) {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check if user has a role property and if it's in allowedRoles
  const userRole = currentUser?.role || "buyer";
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

