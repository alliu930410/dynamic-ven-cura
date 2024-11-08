import { useState } from "react";
import WalletTransactionHistory from "./WalletTransactionHistory";
import { toast } from "react-toastify";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletOperationsProps {
  chainId: number;
  selectedWallet: CustodialWallet;
}

const WalletOperations: React.FC<WalletOperationsProps> = ({
  selectedWallet,
  chainId,
}) => {
  const [activeOperation, setActiveOperation] = useState<string>("history");

  const SelfCustodialComponent = () => {
    const handleFetchPrivateKey = () => {
      // TODO: hit API to get private key
      toast.error("Haven't implemented yet");
    };

    return (
      <div className="relative group" onClick={handleFetchPrivateKey}>
        <img
          src="/icons/key.svg"
          alt="key"
          className="w-6 h-6 cursor-pointer group-hover:fill-red"
        />
        <div className="tooltip hidden group-hover:block absolute z-10 w-48 p-2 text-sm text-white bg-black bg-opacity-80 rounded-md">
          You will reveal the private key of this wallet by pressing, and it's
          not safe if it's leaked.
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-lg w-1/4 ml-6 space-y-4">
      <div className="p-2">
        <SelfCustodialComponent />
      </div>

      <div className="flex-grow flex">
        <WalletTransactionHistory
          chainId={chainId}
          selectedWallet={selectedWallet}
        />
      </div>
    </div>
  );
};

export default WalletOperations;
