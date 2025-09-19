// src/components/Common/CustomInput/CustomInput.tsx
import React from "react";
import "./CustomInput.scss";

interface CustomInputProps {
  type?: string;
  name: string;
  value: string | number;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type = "text",
  name,
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div className="custom-input">
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="input-field"
      />
    </div>
  );
};

export default CustomInput;
