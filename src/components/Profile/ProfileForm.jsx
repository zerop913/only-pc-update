import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useProfileState } from "./ProfileStateContext";
import ProfileField from "./ProfileField";
import { updateProfile } from "../../api";

const ProfileForm = ({ initialData, onSuccess }) => {
  const { setIsEditing, setProfileData } = useProfileState();
  const [formData, setFormData] = useState(initialData || {});
  const [editableFields, setEditableFields] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedProfile = await updateProfile(formData);
      window.showNotification("Профиль успешно обновлен", "success");
      setProfileData(updatedProfile);
      setIsEditing(false);

      if (onSuccess) {
        await onSuccess(); // Вызываем колбэк после успешного обновления
      }
    } catch (error) {
      window.showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldEdit = (fieldId) => {
    setEditableFields((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
  };

  const fields = [
    { id: "username", label: "Логин", required: true },
    { id: "firstName", label: "Имя" },
    { id: "lastName", label: "Фамилия" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Телефон", type: "phone" },
    { id: "dateOfBirth", label: "Дата рождения", type: "date" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <ProfileField
            key={field.id}
            label={field.label}
            value={formData[field.id]}
            type={field.type || "text"}
            isEditing={true}
            onEdit={() => handleFieldEdit(field.id)}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
            isEditable={editableFields[field.id]}
            required={field.required}
          />
        ))}
      </div>

      <div className="flex space-x-4">
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200"
        >
          Отмена
        </motion.button>
      </div>
    </form>
  );
};

export default ProfileForm;
