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

const ProfileAvatar = ({ profile }) => {
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
        <span className="text-[#E0E1E6] text-3xl font-medium">{initials}</span>
      ) : (
        <User size={48} className="text-[#9D9EA6]" />
      )}
    </div>
  );
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
        },
      ],
    },
  ];

  const incompleteFields = fieldGroups
    .flatMap((group) => group.fields)
    .filter(({ id }) => !profile?.[id] && profile?.[id] !== 0)
    .filter(
      ({ id }) => !["id", "user_id", "created_at", "updated_at"].includes(id)
    );

  const ProfileHeader = () => (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8 bg-[#1D1E2C] rounded-2xl mb-8">
        <ProfileAvatar profile={profile} />

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

      {incompleteFields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1D1E2C]/50 backdrop-blur-sm p-6 rounded-xl border border-[#2A2D3E]"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-[#2A2D3E] rounded-lg">
              <AlertCircle className="text-[#9D9EA6]" size={20} />
            </div>
            <div>
              <h3 className="text-[#E0E1E6] font-medium mb-1">
                Заполните профиль полностью
              </h3>
              <p className="text-[#9D9EA6] text-sm leading-relaxed">
                Это поможет нам предоставить более персонализированный опыт.
                Осталось заполнить:{" "}
                {incompleteFields.map((field) => field.label).join(", ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {fieldGroups.map((group, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-[#9D9EA6] text-sm font-medium px-1">
            {group.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.fields.map(({ id, label, icon, priority }) => (
              <motion.div
                key={id}
                whileHover={{ scale: 1.01 }}
                className={`
                    p-5 rounded-xl transition-all duration-200 cursor-pointer
                    ${priority === "high" ? "bg-[#1D1E2C]" : "bg-[#1D1E2C]/70"}
                    ${!profile?.[id] ? "border border-[#2A2D3E]/50" : "border border-transparent"}
                    hover:border-[#2A2D3E] hover:bg-[#1D1E2C]
                  `}
              >
                <div className="flex items-center space-x-3 mb-1.5">
                  <div className="text-[#9D9EA6]">{icon}</div>
                  <p className="text-[#9D9EA6] text-sm">{label}</p>
                </div>
                <p className="text-[#E0E1E6] pl-8 font-medium">
                  {profile?.[id] || (
                    <span className="text-[#9D9EA6] italic font-normal text-sm">
                      Не указано
                    </span>
                  )}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileView;
