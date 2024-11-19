import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "../../hooks/useProfile";
import ProfileField from "./ProfileField";
import { useProfileState } from "./ProfileStateContext";
import { ArrowLeft } from "lucide-react";

const ProfileForm = () => {
  const { profile, isLoading, batchUpdate } = useProfile();
  const { setIsEditing } = useProfileState();
  const [formData, setFormData] = useState(profile || {});
  const [editableFields, setEditableFields] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updates = {};
      Object.keys(editableFields).forEach((key) => {
        if (formData[key] !== profile[key]) {
          updates[key] = formData[key];
        }
      });

      if (Object.keys(updates).length > 0) {
        await batchUpdate(updates);
        window.showNotification("Профиль успешно обновлен", "success");
        setIsEditing(false);
      }
    } catch (error) {
      window.showNotification("Ошибка при обновлении профиля", "error");
    }
  };

  const handleFieldEdit = (fieldId) => {
    setEditableFields((prev) => ({
      ...prev,
      [fieldId]: true,
    }));
    setHasChanges(true);
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleCancel = () => {
    const updatedFormData = { ...formData };
    Object.keys(editableFields).forEach((key) => {
      updatedFormData[key] = profile[key];
    });
    setFormData(updatedFormData);
    setEditableFields({});
    setHasChanges(false);
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
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          type="button"
          onClick={() => setIsEditing(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 text-[#9D9EA6] hover:text-[#E0E1E6] transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Назад к профилю</span>
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {fields.map((field) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileField
                label={field.label}
                value={formData[field.id]}
                type={field.type || "text"}
                isEditing={true}
                isEditable={editableFields[field.id]}
                onEdit={() => handleFieldEdit(field.id)}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          type="submit"
          disabled={isLoading || !hasChanges}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200 ${
            isLoading || !hasChanges ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </motion.button>

        <motion.button
          type="button"
          onClick={handleCancel}
          disabled={isLoading || !hasChanges}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200 ${
            isLoading || !hasChanges ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Отмена
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default ProfileForm;
