import  { useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { Copyicon } from "../../assets/SvgIcon/SvgIcon.tsx";

interface CopyTextProps {
  text: string;
}

export default function CopyText({ text }: CopyTextProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Tooltip title={copied ? "Copied" : "Copy"} className="copyIconToolTip">
      <div onClick={handleCopyClick} style={{ cursor: "pointer" }}>
        {copied ? <CheckOutlined /> : <Copyicon />}
      </div>
    </Tooltip>
  );
}
