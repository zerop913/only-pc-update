import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import FormField from "./FormField";
import SimpleCaptcha from "./SimpleCaptcha";
import { useNavigate } from "react-router-dom";
import { register } from "../../redux/features/auth/authThunks";

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [captchaPassed, setCaptchaPassed] = useState(false);

  const fields = [
    { id: "username", label: "Логин", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Пароль", type: "password" },
    { id: "confirmPassword", label: "Подтверждение пароля", type: "password" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(formData).some((value) => !value)) {
      window.showNotification("Заполните все поля", "error");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      window.showNotification("Пароли не совпадают", "error");
      return;
    }
    if (!captchaPassed) {
      window.showNotification("Пройдите проверку captcha", "error");
      return;
    }

    try {
      await dispatch(
        register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();
      window.showNotification("Регистрация успешна!", "success");
      navigate("/auth");
    } catch (error) {
      window.showNotification(error || "Ошибка при регистрации", "error");
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
                disabled={loading}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#0E0F18] rounded-lg p-4 border border-[#1F1E24]"
        >
          <h3 className="text-[#E0E1E6] text-sm font-medium mb-4">
            Подтверждение
          </h3>
          {!captchaPassed ? (
            <SimpleCaptcha onCaptchaVerify={setCaptchaPassed} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 text-green-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Проверка пройдена</span>
            </motion.div>
          )}
        </motion.div>

        <motion.button
          type="submit"
          disabled={!captchaPassed || loading}
          variants={itemVariants}
          whileHover={captchaPassed && !loading ? { scale: 1.02 } : {}}
          whileTap={captchaPassed && !loading ? { scale: 0.98 } : {}}
          className={`${
            captchaPassed && !loading
              ? "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#2A2D3E] hover:text-[#E0E1E6]"
              : "bg-[#1D1E2C] text-[#6D6E7A] cursor-not-allowed"
          } px-4 py-3 rounded-md transition-colors duration-200 text-lg font-medium`}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </motion.button>
      </form>

      <motion.div className="relative" variants={itemVariants}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1F1E24]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-[#9D9EA6] bg-[#12131E]">
            Уже есть аккаунт?
          </span>
        </div>
      </motion.div>

      <motion.button
        onClick={() => navigate("/auth")}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200 w-full"
      >
        Войти
      </motion.button>
    </motion.div>
  );
};

export default RegisterForm;
