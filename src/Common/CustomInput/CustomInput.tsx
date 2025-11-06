// src/components/Common/CustomInput/CustomInput.tsx
import React from "react";
import "./CustomInput.scss";

interface CustomInputProps {
  type?: string;
  name: string;
  disable?: boolean;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type = "text",
  name,
  value,
  placeholder,
  onChange = () => {},
  disable = false,
}) => {
  return (
    <div className="custom-input">
      <input
        type={type}
        name={name}
        value={value}
        disabled={disable}
        placeholder={placeholder}
        onChange={onChange}
        className="input-field"
      />
    </div>
  );
};

export default CustomInput;
