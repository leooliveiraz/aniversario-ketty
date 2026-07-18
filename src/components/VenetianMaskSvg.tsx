import React from "react";

interface MaskProps {
  className?: string;
  variant?: "gold" | "marsala" | "silver" | "velvet";
}

export const VenetianMaskSvg: React.FC<MaskProps> = ({ className = "w-12 h-12", variant = "gold" }) => {
  const primaryColor =
    variant === "marsala"
      ? "#7A1C28"
      : variant === "silver"
      ? "#C0C0C0"
      : variant === "velvet"
      ? "#400B12"
      : "#D4AF37";

  const secondaryColor =
    variant === "marsala"
      ? "#F5D0A9"
      : variant === "silver"
      ? "#E8E8E8"
      : variant === "velvet"
      ? "#D4AF37"
      : "#FFF1B0";

  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`maskGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="50%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
        <linearGradient id={`goldBorder-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFF1B0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
      </defs>

      {/* Feather flourish top left */}
      <path
        d="M 60 25 C 40 5, 20 15, 10 30 C 25 35, 45 30, 60 25 Z"
        fill={`url(#goldBorder-${variant})`}
        opacity="0.8"
      />
      {/* Feather flourish top right */}
      <path
        d="M 140 25 C 160 5, 180 15, 190 30 C 175 35, 155 30, 140 25 Z"
        fill={`url(#goldBorder-${variant})`}
        opacity="0.8"
      />

      {/* Main Mask Silhouette */}
      <path
        d="M 100 45 
           C 120 30, 160 25, 185 40 
           C 195 55, 190 85, 165 95 
           C 140 105, 115 80, 100 75 
           C 85 80, 60 105, 35 95 
           C 10 85, 5 55, 15 40 
           C 40 25, 80 30, 100 45 Z"
        fill={`url(#maskGrad-${variant})`}
        stroke={`url(#goldBorder-${variant})`}
        strokeWidth="3"
      />

      {/* Left Eye Cutout */}
      <path
        d="M 40 58 C 55 48, 75 52, 82 65 C 72 72, 50 72, 40 58 Z"
        fill="#1A060B"
        stroke={`url(#goldBorder-${variant})`}
        strokeWidth="2"
      />

      {/* Right Eye Cutout */}
      <path
        d="M 160 58 C 145 48, 125 52, 118 65 C 128 72, 150 72, 160 58 Z"
        fill="#1A060B"
        stroke={`url(#goldBorder-${variant})`}
        strokeWidth="2"
      />

      {/* Center Crown Emblem */}
      <circle cx="100" cy="42" r="5" fill="#FFF1B0" />
      <path
        d="M 95 42 L 100 32 L 105 42 L 100 38 Z"
        fill={`url(#goldBorder-${variant})`}
      />

      {/* Decorative Scrolls */}
      <path
        d="M 25 50 Q 10 60 20 75"
        stroke={`url(#goldBorder-${variant})`}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 175 50 Q 190 60 180 75"
        stroke={`url(#goldBorder-${variant})`}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};
