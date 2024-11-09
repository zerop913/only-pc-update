import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header/Header";
import RegisterForm from "../components/Auth/RegisterForm";
import Notification from "../components/UI/Notification";

const RegisterPage = () => {
  useEffect(() => {
    document.title = "Регистрация | OnlyPC";
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0F18]">
      <Header />
      <Notification />
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto bg-[#12131E] rounded-xl p-8 border border-[#1F1E24]">
          <h1 className="text-[#E0E1E6] text-2xl font-bold mb-8 text-center">
            Регистрация
          </h1>
          <RegisterForm />
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
