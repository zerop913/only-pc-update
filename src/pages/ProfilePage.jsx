import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import ProfileContent from "../components/Profile/ProfileContent";
import Notification from "../components/UI/Notification";
import { LogOut } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { useAuth } from "../hooks/useAuth";
import { ProfileStateProvider } from "../components/Profile/ProfileStateContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, isLoading, error, refetchProfile } = useProfile();
  const { isAuthenticated, checkAuth } = useAuth();

  const initProfile = useCallback(async () => {
    const isAuthed = await checkAuth();
    if (!isAuthed) {
      navigate("/auth", { replace: true });
      return;
    }

    try {
      await refetchProfile(true);
    } catch (err) {
      navigate("/auth", { replace: true });
    }
  }, [checkAuth, navigate, refetchProfile]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }

    document.title = "Профиль | OnlyPC";
    initProfile();
  }, [isAuthenticated, initProfile, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth", { replace: true });
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0E0F18]">
        <Header />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center">
          <div className="text-[#E0E1E6]">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F18]">
      <Header />
      <Notification />
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[#E0E1E6] text-2xl font-bold">
              Профиль пользователя
            </h1>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#9D9EA6]  hover:text-[#E0E1E6] transition-colors duration-200"
            >
              <LogOut size={18} />
              <span>Выйти</span>
            </motion.button>
          </div>

          <div className="bg-[#12131E] rounded-xl p-8 border border-[#1F1E24]">
            <ProfileStateProvider>
              <ProfileContent
                profile={profile}
                isLoading={isLoading}
                error={error}
                onProfileUpdate={refetchProfile}
              />
            </ProfileStateProvider>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
