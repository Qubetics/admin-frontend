import React from "react";
import "./CustomInput.scss";
import type { CustomInputProps } from "../../utils/Interfaces";

const CustomInput: React.FC<CustomInputProps> = ({
  type = "text",
  name,
  value,
  placeholder,
  onChange = () => {},
  disable = false,
  options = [],
}) => {
  if (type === "select") {
    return (
      <div className={"custom-input"}>
        <div className="select-wrap">
          <select
            name={name}
            value={value || ""}
            disabled={disable}
            onChange={onChange}
            className="select-field"
          >
            <option value="" disabled>
              {"Choose"}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="chevron" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="custom-input">
      <input
        type={type}
        name={name}
        value={value}
        disabled={disable}
        placeholder={placeholder}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        className="input-field"
      />
    </div>
  );
};

export default CustomInput;
