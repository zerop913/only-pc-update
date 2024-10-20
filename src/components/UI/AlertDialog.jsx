import React, { useEffect, useRef } from "react";

const AlertDialog = ({ isOpen, onClose, onConfirm }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.style.display = "block";
      setTimeout(() => {
        dialog.style.opacity = "1";
        dialog.style.transform = "translateY(0)";
      }, 10);
    } else {
      dialog.style.opacity = "0";
      dialog.style.transform = "translateY(-10px)";
      setTimeout(() => {
        dialog.style.display = "none";
      }, 300);
    }
  }, [isOpen]);

  return (
    <div
      ref={dialogRef}
      className="absolute z-50 bg-[#1D1E2C] border border-[#2A2D3E] rounded-lg p-3 shadow-lg mt-2"
      style={{
        width: "max-content",
        maxWidth: "200px",
        opacity: 0,
        transform: "translateY(-10px)",
        transition: "opacity 300ms, transform 300ms",
        right: 0,
        display: "none",
      }}
    >
      <p className="text-[#9D9EA6] text-sm mb-3">Удалить товар из сборки?</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-2 py-1 text-xs bg-[#2A2D3E] text-[#E0E1E6] rounded-md hover:bg-[#353849] transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={onConfirm}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default AlertDialog;
