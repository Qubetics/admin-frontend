import { useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { NewCopyIcon } from "../../assets/StoreAsset/StoreAsset.tsx";
import type { CopyTextProps } from "../../utils/Interfaces/index.tsx";

const CopyText = ({ text }: CopyTextProps) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
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
      <div onClick={handleCopyClick} style={{ zIndex: 1, cursor: "pointer" }}>
        {copied ? <CheckOutlined /> : <NewCopyIcon />}
      </div>
    </Tooltip>
  );
};
export default CopyText;
