// Extend the Window interface to include Keplr
declare interface Window {
  keplr?: {
    enable: (chainId: string) => Promise<void>;
    disable: (chainId: string) => Promise<void>;
    getOfflineSigner: (chainId: string) => {
      getAccounts: () => Promise<Array<{ address: string }>>;
    };
  };
}
