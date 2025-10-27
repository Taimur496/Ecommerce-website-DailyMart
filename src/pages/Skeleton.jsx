import React from "react";
import "../assets/css/skeleton.css";

const Skeleton = ({ width = "100%", height = "300px", className = "" }) => {
  return (
    <div className={`skeleton ${className}`} style={{ width, height }}>
      <div className="skeleton-shimmer" />
    </div>
  );
};

// Demo component showing multiple skeleton loaders
const SkeletonDemo = () => {
  return (
    <div
      style={{
        padding: "14px 32px",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          maxWidth: "100%",
        }}
      >
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" />
        <Skeleton height="15px" width="60%" />
      </div>
    </div>
  );
};

export default SkeletonDemo;
