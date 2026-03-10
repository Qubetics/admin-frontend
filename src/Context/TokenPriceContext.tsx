import { createContext, useContext, useEffect, useState } from "react";
import { apiUrls } from "../Constant/apiUrls";
import { envConstants } from "../Constant/envConstants";

interface TokenPriceContextType {
  tokenPrice: number;
  tokenPriceLoading: boolean;
}

const TokenPriceContext = createContext<TokenPriceContextType | undefined>(undefined);

export const TokenPriceProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [tokenPriceLoading, setTokenPriceLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTokenPrice = async () => {
      setTokenPriceLoading(true);
      try {
        const response = await fetch(`${envConstants.app_api_url}${apiUrls.currentTokenPrice}`);
        const data = await response.json();
        if (data?.data?.current_token_price) {
          setTokenPrice(Number(data.data.current_token_price));
        }
      } catch (error) {
        console.error("Failed to fetch token price:", error);
      } finally {
        setTokenPriceLoading(false);
      }
    };

    fetchTokenPrice();
  }, []);

  return <TokenPriceContext.Provider value={{ tokenPrice, tokenPriceLoading }}>{children}</TokenPriceContext.Provider>;
};

export const useTokenPrice = (): TokenPriceContextType => {
  const context = useContext(TokenPriceContext);
  if (!context) {
    throw new Error("useTokenPrice must be used within a TokenPriceProvider");
  }
  return context;
};
