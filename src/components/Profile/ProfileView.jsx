import React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  AtSign,
  Badge,
  Edit2,
} from "lucide-react";
import { useProfileState } from "./ProfileStateContext";
import ProfileTabs from "./ProfileTabs";

const formatDate = (dateString) => {
  if (!dateString) return "Не указано";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ProfileView = ({ profile }) => {
  const { setIsEditing } = useProfileState();

  const fieldGroups = [
    {
      title: "Основная информация",
      fields: [
        {
          id: "username",
          label: "Логин",
          icon: <Badge size={18} />,
          priority: "high",
        },
        {
          id: "email",
          label: "Email",
          icon: <Mail size={18} />,
          priority: "high",
        },
      ],
    },
    {
      title: "Личные данные",
      fields: [
        { id: "firstName", label: "Имя", icon: <User size={18} /> },
        { id: "lastName", label: "Фамилия", icon: <User size={18} /> },
        { id: "phone", label: "Телефон", icon: <Phone size={18} /> },
        {
          id: "dateOfBirth",
          label: "Дата рождения",
          icon: <Calendar size={18} />,
          formatter: formatDate,
        },
      ],
    },
  ];

  const ProfileAvatar = () => {
    const getInitials = () => {
      if (profile?.firstName && profile?.lastName) {
        return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
      }
      if (profile?.firstName) {
        return `${profile.firstName[0]}`.toUpperCase();
      }
      return null;
    };

    const initials = getInitials();
    const hasInitials = initials !== null;

    return (
      <div className="w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden bg-[#2A2D3E]">
        {hasInitials ? (
          <span className="text-[#E0E1E6] text-3xl font-medium">
            {initials}
          </span>
        ) : (
          <User size={48} className="text-[#9D9EA6]" />
        )}
      </div>
    );
  };

  const ProfileHeader = () => (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8 bg-[#1D1E2C] rounded-2xl mb-8">
        <ProfileAvatar />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-[#E0E1E6] text-2xl font-semibold mb-2">
            {profile?.firstName
              ? `${profile.firstName} ${profile?.lastName || ""}`
              : "@" + profile?.username || "Пользователь"}
          </h2>
          <p className="text-[#9D9EA6] text-sm mb-4">
            {profile?.email || "Email не указан"}
          </p>
          <motion.button
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2A2D3E] text-[#E0E1E6] px-6 py-2.5 rounded-lg hover:bg-[#363952] transition-all duration-200 inline-flex items-center space-x-2"
          >
            <Edit2 size={16} />
            <span>Редактировать</span>
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <ProfileHeader />
      <ProfileTabs profile={profile} fieldGroups={fieldGroups} />
    </div>
  );
};

export default ProfileView;
