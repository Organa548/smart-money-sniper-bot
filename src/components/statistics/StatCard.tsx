
import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  iconClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, iconClass }) => {
  return (
    <div className="bg-trading-card rounded-lg p-4 flex flex-col">
      <div className="text-non-applicable text-sm mb-2">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default StatCard;
