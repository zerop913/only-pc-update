import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const formatFieldValue = (field, value) => {
  if (!value) return value;

  if (field === "dateOfBirth") {
    const date = new Date(value);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return value;
};

const ProfileDetails = ({ profile, fieldGroups }) => {
  const incompleteFields = fieldGroups
    .flatMap((group) => group.fields)
    .filter(({ id }) => !profile?.[id] && profile?.[id] !== 0)
    .filter(
      ({ id }) => !["id", "user_id", "created_at", "updated_at"].includes(id)
    );

  return (
    <div className="space-y-8">
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
            {group.fields.map(({ id, label, icon, priority, formatter }) => (
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
                  {formatter
                    ? formatter(profile?.[id])
                    : profile?.[id] || (
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

export default ProfileDetails;
