// useAuthCheck.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout, setCredentials } from "../store/authSlice";
import { authApi } from "../services/authApi";
import { store } from "../store";
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
        console.log(res);

        console.log(store.getState().auth.accessToken);
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
