import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header/Header";

const NotFound = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0F18] to-[#1A1B2E]">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="relative w-96 h-96 mx-auto mb-12"
          animate={{
            rotateY: position.x / 60,
            rotateX: -position.y / 60,
          }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A2D3E" />
                <stop offset="100%" stopColor="#1A1B2E" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect
              x="20"
              y="10"
              width="160"
              height="180"
              rx="10"
              fill="url(#caseGrad)"
            />

            <rect
              x="25"
              y="15"
              width="150"
              height="170"
              rx="5"
              fill="#0E0F18"
            />

            <circle cx="35" cy="25" r="5" fill="#4A4D5E" />

            <motion.circle
              cx="35"
              cy="25"
              r="2"
              fill="#00ff00"
              filter="url(#glow)"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <rect x="50" y="20" width="10" height="5" fill="#4A4D5E" />
            <rect x="65" y="20" width="10" height="5" fill="#4A4D5E" />

            {[...Array(5)].map((_, i) => (
              <rect
                key={i}
                x="130"
                y={20 + i * 10}
                width="40"
                height="3"
                fill="#1A1B2E"
              />
            ))}

            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="100" cy="100" r="40" fill="#1A1B2E" />
              {[...Array(4)].map((_, i) => (
                <rect
                  key={i}
                  x="98"
                  y="60"
                  width="4"
                  height="40"
                  fill="#4A4D5E"
                  transform={`rotate(${i * 90} 100 100)`}
                />
              ))}
            </motion.g>

            <foreignObject x="50" y="155" width="100" height="30">
              <div xmlns="http://www.w3.org/1999/xhtml">
                <motion.p
                  className="text-[#E0E1E6] text-center font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                >
                  Error 404
                </motion.p>
              </div>
            </foreignObject>
          </svg>
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#E0E1E6] mb-4">
            Упс! Компонент не найден
          </h1>
          <p className="text-[#9D9EA6] mb-8">
            Похоже, запрошенный компонент отсутствует в нашей базе сайта.
          </p>
          <div className="space-y-4">
            <motion.button
              onClick={handleGoBack}
              className="inline-block bg-[#2A2D3E] text-[#E0E1E6] px-6 py-3 rounded-md mr-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Вернуться назад
            </motion.button>
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="bg-[#4A4D5E] text-[#E0E1E6] px-6 py-3 rounded-md"
              >
                В конфигуратор
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
