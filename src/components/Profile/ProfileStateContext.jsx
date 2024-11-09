import React, { createContext, useContext, useState } from "react";

const ProfileStateContext = createContext();

export const getFieldLabel = (field) => {
  const labels = {
    username: "Логин",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Email",
    phone: "Телефон",
    dateOfBirth: "Дата рождения",
  };
  return labels[field] || field;
};

export const ProfileStateProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  return (
    <ProfileStateContext.Provider
      value={{
        isEditing,
        setIsEditing,
        profileData,
        setProfileData,
      }}
    >
      {children}
    </ProfileStateContext.Provider>
  );
};

export const useProfileState = () => {
  const context = useContext(ProfileStateContext);
  if (!context) {
    throw new Error(
      "useProfileState must be used within a ProfileStateProvider"
    );
  }
  return context;
};
