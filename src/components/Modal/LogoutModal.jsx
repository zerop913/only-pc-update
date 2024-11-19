import React from "react";
import { motion } from "framer-motion";
import Button from "../UI/Button";
import { LogOut } from "lucide-react";

const LogoutModal = ({ onLogout, onCancel }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <LogOut className="w-8 h-8 text-red-500" />
        <h2 className="text-[#E0E1E6] text-xl font-semibold">
          Выход из аккаунта
        </h2>
      </div>
      <p className="text-[#9D9EA6]">
        Вы уверены, что хотите выйти из своего аккаунта? Вам потребуется
        повторная авторизация для доступа к профилю.
      </p>
      <motion.div
        className="flex justify-end space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={onCancel} variant="secondary">
          Отмена
        </Button>
        <Button onClick={onLogout} variant="danger">
          Выйти
        </Button>
      </motion.div>
    </div>
  );
};

export default LogoutModal;
