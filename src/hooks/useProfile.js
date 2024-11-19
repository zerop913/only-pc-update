import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProfile,
  updateProfileField,
  batchUpdateProfile,
} from "../redux/features/profile/profileThunks";
import { setAuthenticated } from "../redux/features/auth/authSlice";
import { authManager } from "../redux/middleware/authMiddleware";

export const useProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data: profile,
    loading: isLoading,
    error,
    lastUpdated,
  } = useSelector((state) => state.profile);

  const fetchInProgress = useRef(false);

  const fetchProfileData = useCallback(
    async (force = false) => {
      if (fetchInProgress.current && !force) return;

      try {
        fetchInProgress.current = true;
        await dispatch(fetchProfile(force)).unwrap();
      } catch (err) {
        // При 401 ошибке принудительно разлогиниваем
        if (err.status === 401) {
          dispatch(setAuthenticated(false));
          authManager.clearToken();
          navigate("/auth", { replace: true });
        }
        return null;
      } finally {
        fetchInProgress.current = false;
      }
    },
    [dispatch, navigate]
  );

  const updateField = useCallback(
    async (field, value) => {
      try {
        await dispatch(updateProfileField({ field, value })).unwrap();
      } catch (err) {
        // Обработка ошибки 401 при обновлении поля
        if (err.status === 401) {
          dispatch(setAuthenticated(false));
          authManager.clearToken();
          navigate("/auth", { replace: true });
        }
        return null;
      }
    },
    [dispatch, navigate]
  );

  const batchUpdate = useCallback(
    async (updates) => {
      try {
        await dispatch(batchUpdateProfile(updates)).unwrap();
      } catch (err) {
        // Обработка ошибки 401 при пакетном обновлении
        if (err.status === 401) {
          dispatch(setAuthenticated(false));
          authManager.clearToken();
          navigate("/auth", { replace: true });
        }
        return null;
      }
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    if (!lastUpdated && !isLoading && !fetchInProgress.current) {
      fetchProfileData();
    }
  }, [fetchProfileData, lastUpdated, isLoading]);

  return {
    profile,
    isLoading,
    error,
    refetchProfile: fetchProfileData,
    updateField,
    batchUpdate,
  };
};
