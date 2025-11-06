"use client";

import React, { useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import CustomInput from "../../Common/CustomInput/CustomInput";
import "./ServiceProvider.scss";
import {
  buildRegisterProviderMessage,
  buildUpdateProviderStatusMessage,
} from "../../service/BuildMessage/buildMessage";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { toast } from "react-toastify";
import { convertNodeToWallet, computePubKey } from "../../utils/Helper/CommonHelper";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import { DESCRIPTION, HEADING, provWalletPrefix, STATUS_ENUM } from "../../Constant/constants";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import { apiMethods } from "../../Constant/constants";
import { envConstants } from "../../Constant/envConstants";
import { useNavigate } from "react-router-dom";
import NotificationToast from "../../Common/NotificationModal/NotificationModal";

interface ServiceProviderFormData {
  name: string;
  email: string;
  website: string;
  description: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  website?: string;
  description?: string;
}

const ServiceProvider = () => {
  const useGetApi = useNetworkRequest();
  const navigate = useNavigate();
  const { authData } = useIsLoggedIn();

  const [formData, setFormData] = useState<ServiceProviderFormData>({
    name: "",
    email: "",
    website: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showRegisterToast, setShowRegisterToast] = useState(false);
  const [showProviderToast, setShowProviderToast] = useState(false);

  const provAddress = convertNodeToWallet(authData, provWalletPrefix);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.website.trim()) newErrors.website = "Website URL is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const registerTx = await processTransaction(
        buildRegisterProviderMessage({
          from: authData,
          name: formData.name,
          website: formData.website,
          description: formData.description,
        })
      );
      if (!registerTx) return;
      setShowRegisterToast(true);

      const statusTx = await processTransaction(
        buildUpdateProviderStatusMessage({
          from: provAddress,
          status: STATUS_ENUM.STATUS_ACTIVE,
        })
      );
      if (!statusTx) return;

      setShowProviderToast(true);

      const keplr = (window as any)?.keplr;
      if (!keplr) return toast.error("Keplr wallet not found");

      const { signature, pub_key } = await keplr.signArbitrary(envConstants.chainId, authData, authData);
      if (!signature) return toast.error("Signature rejected");

      const pubKeyFromSignature = computePubKey(authData, signature, authData);
      const { success } = await useGetApi({
        endpoint: apiUrls.register,
        method: apiMethods.POST,
        body: {
          address: authData,
          name: formData.name,
          email: formData.email,
          url: formData.website,
          description: formData.description,
          pubKey: pubKeyFromSignature,
          signature: { pub_key, signature },
          txHash: Buffer.from(statusTx).toString("hex"),
        },
      });

      if (success) {
        toast.success("Registration successful!");
        navigate("/dashboard");
      } else {
        toast.error("Registration failed.");
        setFormData({ name: "", email: "", website: "", description: "" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during registration");
    }
  };

  return (
    <div className='mainContainer'>
      <h4>Register as Service Provider</h4>

      <div className='borderDiv borderDiv-bordered'>
        <h4 className='borderDiv-header'>Connect Keplr Wallet</h4>
        <div>
          Ensure that you are connected to the correct Keplr wallet before proceeding with the Service Provider
          registration.
          <br />
          The wallet you connect will be used to verify your identity, manage your node registration, and handle all
          related transactions on the blockchain. Connecting the wrong wallet may prevent successful registration or
          cause discrepancies in ownership verification.
        </div>
      </div>

      <form className='formDiv' onSubmit={handleSubmit}>
        <label>
          Name<span className='redText'>*</span>
        </label>
        <CustomInput type='text' name='name' placeholder='Enter Name' value={formData.name} onChange={handleChange} />
        {errors.name && <div className='redText'>{errors.name}</div>}

        <label>Email Address</label>
        <CustomInput
          type='email'
          name='email'
          placeholder='Enter your email address'
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <div className='redText'>{errors.email}</div>}

        <label>
          Website URL<span className='redText'>*</span>
        </label>
        <CustomInput
          type='text'
          name='website'
          placeholder='Enter Website URL'
          value={formData.website}
          onChange={handleChange}
        />
        {errors.website && <div className='redText'>{errors.website}</div>}

        <label>
          Description<span className='redText'>*</span>
        </label>
        <CustomInput
          type='text'
          name='description'
          placeholder='Enter Description'
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <div className='redText'>{errors.description}</div>}

        <ButtonCustom label='Submit' />
      </form>

      <NotificationToast
        show={showRegisterToast}
        handleClose={() => setShowRegisterToast(false)}
        heading={HEADING.REGISTER_PROVIDER}
        description={DESCRIPTION.REGISTER_PROVIDER}
      />

      <NotificationToast
        show={showProviderToast}
        handleClose={() => setShowProviderToast(false)}
        heading={HEADING.PROVIDER_STATUS}
        description={DESCRIPTION.PROVIDER_STATUS}
      />
    </div>
  );
};

export default ServiceProvider;
