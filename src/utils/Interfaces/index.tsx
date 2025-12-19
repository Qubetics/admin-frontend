import type { ReactNode } from "react";

export interface Plan {
  id: string;
  prov_address: string;
  gigabytes: string;
  hours: string;
  prices: { denom: string; amount: string, quote_value: string }[];
  status: string;
  status_at: string;
}
export interface CreatePlanModalProps {
  createShow: boolean;
  setCreateShow: React.Dispatch<React.SetStateAction<boolean>>;
  getAllPlan: () => Promise<void> | void;
  provAddress: string;
}

export interface CopyTextProps {
  text: string;
}

export interface KeplrWindow extends Window {
  keplr?: {
    enable: (chainId: string) => Promise<void>;
    disable: (chainId: string) => Promise<void>;
    getOfflineSigner: (chainId: string) => {
      getAccounts: () => Promise<Array<{ address: string }>>;
    };
    signArbitrary: (
      chainId: string,
      address: string,
      message: string
    ) => Promise<{
      signature: string;
      pub_key: any;
    }>;
  };
}

export interface OnboardAuthLayoutProps {
  children?: ReactNode;
}

export interface SkeletonProps {
  rows?: number;
  columns: number;
}

export interface AuthContextType {
  authData: string;
  setAuthData: React.Dispatch<React.SetStateAction<string>>;
  providerName: string;
  setProviderName: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  logout: () => void;
  isExist: boolean;
  setIsExist: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null) => ReactNode;
}
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface CardBoxProps {
  title: string;
  value: string | number;
  icons?: any;
}

export interface TableRow {
  orgName: string;
  email: string;
  location: string;
  nodeAddress: string;
  bandwidth: string;
  plan: string;
  requestFor: string;
  planId: string;
  hours: string;
}

export interface ServiceProviderFormData {
  name: string;
  email: string;
  website: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  website?: string;
}
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

type Option = { label: string; value: string | number };
export interface CustomInputProps {
  type?: string;
  name: string;
  disable?: boolean;
  value?: string | number;
  placeholder?: string;
  onChange?: (e: any) => void;
  options?: Option[];
}

export type ButtonItem = {
  label: React.ReactNode;
  value: string;
  count: number;
};

export type ConfirmationModalProps = {
  show: boolean;
  heading?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};
