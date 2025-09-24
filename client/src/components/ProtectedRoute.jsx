import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ roles }) {
  const { user, accessToken } = useSelector((state) => state.auth);
    
  // 1. Chưa login → chuyển về login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 2. Không có quyền → chuyển về trang forbidden
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // 3. Đúng quyền → render component
  return <Outlet />; // Render the child routes
}

export default ProtectedRoute;
