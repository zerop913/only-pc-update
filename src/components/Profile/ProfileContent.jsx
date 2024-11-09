import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ProfileForm from "./ProfileForm";
import ProfileView from "./ProfileView";
import { useProfileState } from "./ProfileStateContext";
import ProfileSkeleton from "./ProfileSkeleton";

const ProfileContent = ({ profile, isLoading, error, onProfileUpdate }) => {
  const { isEditing, setProfileData } = useProfileState();

  // Обновляем данные профиля в контексте при их получении
  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile, setProfileData]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-500 text-center p-4"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isEditing ? (
        <ProfileForm
          initialData={profile}
          onSuccess={() => {
            if (onProfileUpdate) {
              onProfileUpdate();
            }
          }}
        />
      ) : (
        <ProfileView profile={profile} />
      )}
    </motion.div>
  );
};

export default ProfileContent;
