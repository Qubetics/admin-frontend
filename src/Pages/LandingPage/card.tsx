import React from "react";
import "./LandingPage.scss";

export type CardProps = {
  title: string;
  description: string;
};

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className="card">
      <h4 className="card-title">{title}</h4>
      <h6 className="card-description">{description}</h6>
    </div>
  );
};

export default Card;
