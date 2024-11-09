import React from "react";

const ProfileSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-[#1D1E2C] p-4 rounded-md animate-pulse">
        <div className="h-4 w-20 bg-[#2A2D3E] rounded mb-2"></div>
        <div className="h-6 w-full bg-[#2A2D3E] rounded"></div>
      </div>
    ))}
  </div>
);

export default ProfileSkeleton;
