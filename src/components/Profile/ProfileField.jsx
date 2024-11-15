import React from "react";
import { Pencil } from "lucide-react";

const ProfileField = ({
  label,
  value,
  type = "text",
  isEditing,
  isEditable,
  onEdit,
  onChange,
  error,
}) => {
  return (
    <div
      className={`bg-[#1D1E2C] p-4 rounded-md relative ${error ? "border-2 border-red-500" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[#9D9EA6] text-sm mb-1">{label}</p>
          {isEditing && isEditable ? (
            <input
              type={type}
              value={value || ""}
              onChange={onChange}
              className="w-full bg-[#2A2D3E] text-[#E0E1E6] p-2 rounded"
            />
          ) : (
            <p className="text-[#E0E1E6]">{value || "Не указано"}</p>
          )}
        </div>
        {isEditing && !isEditable && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-2 p-1 hover:bg-[#2A2D3E] rounded-full transition-colors"
          >
            <Pencil size={16} className="text-[#9D9EA6]" />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ProfileField;
