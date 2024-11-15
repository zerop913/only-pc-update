import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfileField,
  batchUpdateProfile,
} from "../redux/features/profile/profileThunks";

export const useProfile = () => {
  const dispatch = useDispatch();
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
        return null;
      } finally {
        fetchInProgress.current = false;
      }
    },
    [dispatch]
  );

  const updateField = useCallback(
    async (field, value) => {
      try {
        await dispatch(updateProfileField({ field, value })).unwrap();
      } catch (err) {
        return null;
      }
    },
    [dispatch]
  );

  const batchUpdate = useCallback(
    async (updates) => {
      try {
        await dispatch(batchUpdateProfile(updates)).unwrap();
      } catch (err) {
        return null;
      }
    },
    [dispatch]
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
