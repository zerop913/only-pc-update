import React, { useState } from "react";
import { motion } from "framer-motion";

const SimpleCaptcha = ({ onCaptchaVerify }) => {
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { text: `${num1} + ${num2} = ?`, answer: num1 + num2 };
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userInput, setUserInput] = useState("");

  const refreshCaptcha = () => {
    setUserInput("");
    setCaptcha(generateCaptcha());
  };

  const handleVerify = () => {
    if (parseInt(userInput) === captcha.answer) {
      onCaptchaVerify(true);
    } else {
      refreshCaptcha();
    }
  };

  return (
    <motion.div
      className="space-y-3 max-w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center justify-between bg-[#12131E] p-3 rounded-lg"
        whileHover={{ scale: 1.02 }}
      >
        <div
          className="text-[#E0E1E6] font-medium text-lg select-none"
          style={{ userSelect: "none" }}
        >
          {captcha.text}
        </div>
        <motion.button
          type="button"
          onClick={refreshCaptcha}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="text-[#9D9EA6] hover:text-white p-2 rounded-lg transition-colors"
        >
          ↺
        </motion.button>
      </motion.div>
      <div className="flex space-x-2 w-full">
        <motion.input
          type="number"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          className="flex-1 min-w-0 bg-[#12131E] border border-[#1F1E24] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2A2D3E] transition-colors"
          placeholder="Введите ответ"
        />
        <motion.button
          type="button"
          onClick={handleVerify}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="whitespace-nowrap bg-[#1D1E2C] text-[#9D9EA6] px-4 py-2 rounded-md hover:bg-[#2A2D3E] hover:text-[#E0E1E6] transition-colors duration-200"
        >
          Проверить
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SimpleCaptcha;
