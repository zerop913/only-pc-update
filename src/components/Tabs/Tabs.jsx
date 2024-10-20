import React from "react";

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "products", label: "Товары" },
    { id: "build", label: "Сборка" },
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-[#1D1E2C] rounded-full p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-6 text-sm font-medium rounded-full transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-[#2A2D3E] text-[#E0E1E6]"
                : "text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
