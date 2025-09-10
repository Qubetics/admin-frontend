import React from "react";

export interface inputCustomProps {
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string | boolean;
  regularInput?: boolean;
  passwordInput?: boolean;
  id?: string;
  name?: string;
  value?: string;
  customClass?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  tabIndex?: number;
  disabled?: boolean;
  required?: boolean;
}

export interface ButtonCustomProps {
  onClick?: () => void;
  label?: string;
  className?: string;
  type?: "submit" | "button" | "reset" | undefined;
  bordered?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  id?: string;
}

export interface SubHeaderContentsProps {
  onClick?: () => void;
  heading?: string;
  subHeading?: string;
  buttonText?: string;
  className?: string;
  type?: "submit" | "button" | "reset" | undefined;
  options?: React.ReactNode;
}

export interface HelpPropsData {
  onClickState?: () => void;
}

export interface FilterOptions {
  id: number;
  text: string;
  name: React.ReactNode;
}

export interface RejectShowState {
  show: boolean;
  nodeAddress: string | null;
}
