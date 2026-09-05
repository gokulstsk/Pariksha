import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

const StatCard = ({ title, value, prefix, suffix, icon, color = "#4f46e5", bgLight = "#eef2ff" }) => {
  return (
    <Card
      style={{
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
      bodyStyle={{ padding: "12px 16px" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Text type="secondary" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {title}
          </Text>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "2px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {prefix}
            {value}
            {suffix}
          </div>
        </div>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: bgLight,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
