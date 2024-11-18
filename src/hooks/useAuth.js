import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/features/auth/authThunks";
import { useProfile } from "./useProfile";
import { authManager } from "../redux/middleware/authMiddleware";
import { useNavigate } from "react-router-dom";
import api from "../redux/services/api";
import { setAuthenticated } from "../redux/features/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { profile } = useProfile();

  const checkAuth = useCallback(async () => {
    const token = authManager.getToken();
    if (!token) {
      await handleLogout();
      return false;
    }

    try {
      if (authManager.isTokenExpired(token)) {
        const isRefreshed = await authManager.refreshTokenIfNeeded({
          dispatch,
        });
        if (!isRefreshed) {
          await handleLogout();
          return false;
        }
      }
      return true;
    } catch (error) {
      await handleLogout();
      return false;
    }
  }, [dispatch]);

  const getDisplayName = () => {
    if (!profile) return "";
    if (profile.firstName) return profile.firstName;
    return profile.username ? `@${profile.username}` : "";
  };

  const handleLogout = async () => {
    try {
      // Сначала меняем состояние в Redux
      dispatch(setAuthenticated(false));

      // Затем выполняем остальные действия
      await dispatch(logout());
      authManager.clearToken();
      delete api.defaults.headers.common["Authorization"];
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      // Даже при ошибке меняем состояние
      dispatch(setAuthenticated(false));
      authManager.clearToken();
      delete api.defaults.headers.common["Authorization"];
      navigate("/auth", { replace: true });
    }
  };

  return {
    isAuthenticated,
    profile,
    displayName: getDisplayName(),
    logout: handleLogout,
    checkAuth,
  };
};
