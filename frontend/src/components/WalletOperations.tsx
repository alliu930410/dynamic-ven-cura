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
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    );
  };

  const SignMessageComponent = () => {
    const handleSignMessage = (message: string) => {
      // TODO: hit API to sign the message
      toast.error("Haven't implemented yet");
    };

    return (
      <div
        className="relative group"
        onClick={() => handleSignMessage("Placeholder Message")}
      >
        <img
          src="/icons/sign.svg"
          alt="sign"
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    );
  };

  const SignTransactionComponent = () => {
    const handleSignTransaction = (to: string, amount: number) => {
      // TODO: hit API to sign the transaction
      toast.error("Haven't implemented yet");
    };

    return (
      <div
        className="relative group"
        onClick={() => handleSignTransaction("0x123", 0.1)}
      >
        <img
          src="/icons/transaction.svg"
          alt="sign"
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    );
  };

  return (
    <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-lg w-1/4 ml-6 space-y-4">
      <div className="flex p-2 justify-between">
        <SignMessageComponent />
        <SignTransactionComponent />
        <SelfCustodialComponent />
      </div>

      {activeOperation === "history" && (
        <div className="flex-grow flex">
          <WalletTransactionHistory
            chainId={chainId}
            selectedWallet={selectedWallet}
          />
        </div>
      )}
    </div>
  );
};

export default WalletOperations;
