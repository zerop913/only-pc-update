import React, { forwardRef } from "react";
import Tooltip from "./Tooltip";

const Button = forwardRef(
  (
    {
      children,
      icon: Icon,
      onClick,
      tooltip,
      variant = "primary",
      hideTooltipOnMobile = false,
      disabled = false,
    },
    ref
  ) => {
    const baseClasses =
      "p-2 rounded-md transition-colors duration-200 flex items-center justify-center";
    const variantClasses = {
      primary: "bg-[#2A2D3E] text-[#E0E1E6] hover:bg-[#353849]",
      secondary:
        "bg-[#1D1E2C] text-[#9D9EA6] hover:bg-[#252736] hover:text-[#B8B9C3]",
      danger: "bg-red-500 text-white hover:bg-red-600",
      disabled: "bg-[#1D1E2C] text-[#6D6E7A] cursor-not-allowed",
    };

    const buttonClass = `${baseClasses} ${
      variantClasses[disabled ? "disabled" : variant]
    }`;

    const button = (
      <button
        ref={ref}
        className={buttonClass}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </button>
    );

    return tooltip ? (
      <Tooltip content={tooltip} hideOnMobile={hideTooltipOnMobile}>
        {button}
      </Tooltip>
    ) : (
      button
    );
  }
);

export default Button;
