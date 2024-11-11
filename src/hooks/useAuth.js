import { useState, useEffect } from "react";
import { useProfile } from "./useProfile";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const getDisplayName = () => {
    if (!profile) return "";
    if (profile.firstName) return profile.firstName;
    return profile.username ? `@${profile.username}` : "";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sessionExpiration");
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    profile,
    displayName: getDisplayName(),
    logout,
  };
};
