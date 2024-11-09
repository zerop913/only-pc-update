import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import ProfileContent from "../components/Profile/ProfileContent";
import Notification from "../components/UI/Notification";
import { useProfile } from "../hooks/useProfile";
import { ProfileStateProvider } from "../components/Profile/ProfileStateContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, isLoading, error, refetchProfile } = useProfile();
  const [key, setKey] = useState(0); // Добавляем ключ для форсирования перерендера

  useEffect(() => {
    document.title = "Профиль | OnlyPC";

    // Проверка авторизации
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleProfileUpdate = async () => {
    await refetchProfile();
    setKey((prevKey) => prevKey + 1); // Обновляем ключ для форсирования перерендера
  };

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
        <div className="max-w-4xl mx-auto bg-[#12131E] rounded-xl p-8 border border-[#1F1E24]">
          <h1 className="text-[#E0E1E6] text-2xl font-bold mb-8">
            Профиль пользователя
          </h1>
          <ProfileStateProvider>
            <ProfileContent
              key={key}
              profile={profile}
              isLoading={isLoading}
              error={error}
              onProfileUpdate={handleProfileUpdate}
            />
          </ProfileStateProvider>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
