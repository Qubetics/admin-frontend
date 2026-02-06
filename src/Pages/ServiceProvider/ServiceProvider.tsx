import React, { useState, useEffect } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import CustomInput from "../../Common/CustomInput/CustomInput";
import "./ServiceProvider.scss";
import {
  buildRegisterProviderMessage,
  buildUpdateProviderStatusMessage,
} from "../../service/BuildMessage/buildMessage";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { toast } from "react-toastify";
import { convertNodeToWallet, fetchStakeAmount, sanitizeInput, api } from "../../utils/Helper/CommonHelper";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import {
  emailRegex,
  ERROR_MSG,
  HEADING,
  nameRegex,
  provWalletPrefix,
  STATUS_ENUM,
  ERROR_MESSAGES,
} from "../../Constant/constants";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import { apiMethods } from "../../Constant/constants";
import { envConstants } from "../../Constant/envConstants";
import { useNavigate } from "react-router-dom";
import NotificationToast from "../../Common/NotificationModal/NotificationModal";
import type { FormErrors, ServiceProviderFormData } from "../../utils/Interfaces";

const ServiceProvider = () => {
  const useGetApi = useNetworkRequest();
  const navigate = useNavigate();
  const { authData, setIsExist, setProviderName } = useIsLoggedIn();

  const [walletBalance, setWalletBalance] = useState(0);
  const [formData, setFormData] = useState<ServiceProviderFormData>({
    name: "",
    email: "",
    website: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showRegisterToast, setShowRegisterToast] = useState(false);
  const [showProviderToast, setShowProviderToast] = useState(false);

  const provAddress = convertNodeToWallet(authData, provWalletPrefix);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const safeValue = sanitizeInput(value, name);

    setFormData((prev) => ({
      ...prev,
      [name]: safeValue,
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "name") {
        if (!safeValue) newErrors.name = "Name is required.";
        else if (safeValue.length < 3 || safeValue.length > 50)
          newErrors.name = "Name must be between 3 and 50 characters.";
        else if (!nameRegex.test(safeValue)) newErrors.name = "Name contains invalid characters.";
        else delete newErrors.name;
      }

      if (name === "email") {
        if (!safeValue) newErrors.email = "Email is required.";
        else if (!emailRegex.test(safeValue)) {
          newErrors.email = "Please enter a valid email address.";
        } else delete newErrors.email;
      }

      if (name === "website") {
        delete newErrors.website;
      }

      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchBalance = async () => {
    if (!authData) return;
    try {
      const uri = `${envConstants.swagger_api}/cosmos/bank/v1beta1/balances/${authData}`;
      const response = await api(uri);

      if (response?.balances?.[0]?.amount) {
        const balanceAmount = Number(response.balances[0].amount) / 1e18;
        setWalletBalance(balanceAmount);
      } else {
        setWalletBalance(0);
      }
    } catch (err) {
      console.log(ERROR_MSG.FAILED_FETCHING_BALANCE, err);
    }
  };

  useEffect(() => {
    if (authData?.length > 0) {
      const timer = setTimeout(() => {
        fetchBalance();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [authData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const minStakeAmount = await fetchStakeAmount();

    try {
      const emailCheck = await useGetApi({
        endpoint: apiUrls.checkDisposableEmail,
        method: apiMethods.POST,
        body: { email: formData.email },
      });

      if (!emailCheck?.success) {
        toast.error(emailCheck?.message || ERROR_MESSAGES.DISPOSABLE_EMAIL);
        return;
      }
    } catch (err: any) {
      toast.error(err?.message || ERROR_MESSAGES.DISPOSABLE_EMAIL);
      return;
    }

    if (Number(walletBalance) < minStakeAmount + 1) {
      toast.error(ERROR_MSG.LOW_BALANCE, { toastId: "low-balance" });
      return;
    }

    try {
      const registerTx = await processTransaction(
        buildRegisterProviderMessage({
          from: authData,
          name: formData.name,
          website: formData.website,
        }),
      );
      if (!registerTx) return;
      setShowRegisterToast(true);

      const statusTx = await processTransaction(
        buildUpdateProviderStatusMessage({
          from: provAddress,
          status: STATUS_ENUM.STATUS_ACTIVE,
        }),
      );
      if (!statusTx) return;

      setShowProviderToast(true);

      const keplr = (window as any)?.keplr;
      if (!keplr) return toast.error("Keplr wallet not found");

      const { signature, pub_key } = await keplr.signArbitrary(envConstants.chainId, authData, authData);
      if (!signature) return toast.error("Signature rejected");

      const { success } = await useGetApi({
        endpoint: apiUrls.register,
        method: apiMethods.POST,
        body: {
          address: authData,
          name: formData.name,
          email: formData.email,
          url: formData.website,
          signature: { pub_key, signature },
          txHash: Buffer.from(statusTx).toString("hex"),
        },
      });

      if (success) {
        setProviderName(formData?.name);
        setIsExist(true);
        toast.success("Registration successful!");
        navigate("/dashboard");
      } else {
        toast.error("Registration failed.");
        setFormData({ name: "", email: "", website: "" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during registration");
    }
  };
  const isFormValid =
    formData?.name?.trim() !== "" && formData?.email?.trim() !== "" && !errors?.name && !errors?.email;

  return (
    <div className="mainContainer">
      <h4 className="mainContainer-heading">Register as Service Provider</h4>
      <div className="borderDiv borderDiv-bordered">
        <h4 className="borderDiv-header">Connect Keplr Wallet</h4>
        <p className="borderDiv-para">
          Make sure you're connected to the correct Keplr wallet before starting your Service Provider registration.
          This wallet will be used to verify your identity, register yourself as a provider, and manage all related
          transactions on the Qubetics Blockchain. If you connect the wrong wallet, your registration may fail or your
          ownership details may not match correctly
        </p>
      </div>

      <form className="formDiv" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Name<span className="redText">*</span>
          </label>
          <CustomInput type="text" name="name" placeholder="Enter name" value={formData.name} onChange={handleChange} />
          {errors.name && <div className="redText">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>
            Email Address<span className="redText">*</span>
          </label>
          <CustomInput
            type="text"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="redText">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Website URL</label>
          <CustomInput
            type="text"
            name="website"
            placeholder="Enter website url"
            value={formData.website}
            onChange={handleChange}
          />
          {errors.website && <div className="redText">{errors.website}</div>}
        </div>
        <ButtonCustom label="Submit" disabled={!isFormValid} />
      </form>

      <NotificationToast
        show={showRegisterToast}
        handleClose={() => setShowRegisterToast(false)}
        heading={HEADING.REGISTER_PROVIDER}
      />

      <NotificationToast
        show={showProviderToast}
        handleClose={() => setShowProviderToast(false)}
        heading={HEADING.PROVIDER_STATUS}
      />
    </div>
  );
};

export default ServiceProvider;
