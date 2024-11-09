import React, { useState } from "react";
import { motion } from "framer-motion";
import FormField from "./FormField";
import { useNavigate } from "react-router-dom";
import { login } from "../../api";

const AuthForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fields = [
    { id: "username", label: "Логин", type: "text" },
    { id: "password", label: "Пароль", type: "password" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      window.showNotification("Заполните все поля", "error");
      return;
    }

    setIsLoading(true);
    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
      window.showNotification("Успешная авторизация!", "success");
      navigate("/profile");
    } catch (error) {
      window.showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <motion.div className="space-y-4" variants={containerVariants}>
          {fields.map((field) => (
            <motion.div key={field.id} variants={itemVariants}>
              <FormField
                {...field}
                value={formData[field.id]}
                onChange={(e) =>
                  setFormData({ ...formData, [field.id]: e.target.value })
                }
                disabled={isLoading}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col space-y-4"
          variants={containerVariants}
        >
          <motion.button
            type="submit"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`bg-[#1D1E2C] text-[#9D9EA6] px-4 py-3 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200 text-lg font-medium ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Вход..." : "Войти"}
          </motion.button>
        </motion.div>
      </form>

      <motion.div className="relative" variants={itemVariants}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1F1E24]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-[#9D9EA6] bg-[#12131E]">
            Нет аккаунта?
          </span>
        </div>
      </motion.div>

      <motion.button
        onClick={() => navigate("/register")}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200 w-full"
      >
        Зарегистрироваться
      </motion.button>
    </motion.div>
  );
};

export default AuthForm;
