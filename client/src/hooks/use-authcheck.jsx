// useAuthCheck.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout, setCredentials } from "../store/authSlice";
import { authApi } from "../services/authApi";
import { useLocation } from "react-router-dom";

function UseAuthCheck({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  useEffect(() => {
    if (publicRoutes.includes(location.pathname)) return;
    const checkAuth = async () => {
      try {
        const res = await authApi.authMe();
        dispatch(setCredentials(res));
      } catch (err) {
        dispatch(logout());
      }
    };
    checkAuth();
  }, [location.pathname, dispatch]);
  return children;
}
export default UseAuthCheck;
