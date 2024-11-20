import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../../hooks/useFavorites";
import ProfileDetails from "./ProfileDetails";
import ProfileFavorites from "./ProfileFavorites";
import { useLocation, useNavigate } from "react-router-dom";

const ProfileTabs = ({ profile, fieldGroups }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, loading } = useFavorites();
  const [[activeTab, direction], setActiveTab] = useState([
    location.hash === "#favorites" ? 1 : 0,
    0,
  ]);

  const tabs = [
    {
      label: "Профиль",
      icon: UserIcon,
      component: <ProfileDetails profile={profile} fieldGroups={fieldGroups} />,
    },
    {
      label: "Избранное",
      icon: HeartIcon,
      component: <ProfileFavorites favorites={favorites} loading={loading} />,
      count: favorites?.length || 0,
    },
  ];

  useEffect(() => {
    const newHash = activeTab === 1 ? "#favorites" : "";
    if (location.hash !== newHash) {
      navigate(newHash, { replace: true });
    }
  }, [activeTab, location.hash, navigate]);

  useEffect(() => {
    const shouldBeActive = location.hash === "#favorites" ? 1 : 0;
    if (activeTab !== shouldBeActive) {
      setActiveTab([shouldBeActive, shouldBeActive > activeTab ? 1 : -1]);
    }
  }, [location.hash]);

  const handleTabChange = (index) => {
    const newDirection = index > activeTab ? 1 : -1;
    setActiveTab([index, newDirection]);
  };

  const slideVariants = {
    enter: (direction) => ({
      y: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      y: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="space-y-6">
      <div className="relative mt-4">
        <div className="flex items-center justify-center gap-4">
          {tabs.map((tab, index) => (
            <div key={index} className="relative">
              <motion.button
                onClick={() => handleTabChange(index)}
                className={`
                  relative z-10 px-8 py-3 rounded-lg flex items-center gap-3
                  ${activeTab === index ? "text-[#E0E1E6]" : "text-[#9D9EA6]"}
                  transition-colors duration-200 group
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <tab.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      activeTab === index
                        ? "text-[#E0E1E6]"
                        : "text-[#9D9EA6] group-hover:text-[#E0E1E6]"
                    }`}
                  />
                  {tab.count > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-[#2A2D3E] rounded-full flex items-center justify-center px-1">
                      <span className="text-[#E0E1E6] text-xs font-medium">
                        {tab.count}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={`font-medium transition-colors duration-200 ${
                    activeTab === index ? "" : "group-hover:text-[#E0E1E6]"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
              {activeTab === index && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute inset-0 bg-[#2A2D3E] rounded-lg -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full overflow-y-auto max-h-[600px] pr-4 scrollbar-thin scrollbar-thumb-[#2A2D3E] scrollbar-track-[#1D1E2C]"
          >
            {tabs[activeTab].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileTabs;
