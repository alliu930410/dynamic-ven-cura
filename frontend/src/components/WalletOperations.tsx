import { useState } from "react";
import WalletTransactionHistory from "./WalletTransactionHistory";
import { toast } from "react-toastify";
import WalletSignMessage from "./WalletSignMessage";
import WalletSendTransaction from "./WalletSendTransaction";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletOperationsProps {
  chainId: number;
  selectedWallet: CustodialWallet;
  interactionToggle: boolean;
  setInteractionToggle: (value: boolean) => void;
}

const WalletOperations: React.FC<WalletOperationsProps> = ({
  selectedWallet,
  chainId,
  interactionToggle,
  setInteractionToggle,
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
    return (
      <div
        className="relative group"
        onClick={() => setActiveOperation("signMessage")}
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
    return (
      <div
        className="relative group"
        onClick={() => setActiveOperation("sendTransaction")}
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
            interactionToggle={interactionToggle}
          />
        </div>
      )}
      {activeOperation === "signMessage" && (
        <div className="flex-grow flex">
          <WalletSignMessage
            selectedWallet={selectedWallet}
            interactionToggle={interactionToggle}
            setInteractionToggle={setInteractionToggle}
          />
        </div>
      )}

      {activeOperation === "sendTransaction" && (
        <div className="flex-grow flex">
          <WalletSendTransaction
            chainId={chainId}
            selectedWallet={selectedWallet}
            interactionToggle={interactionToggle}
            setInteractionToggle={setInteractionToggle}
          />
        </div>
      )}
    </div>
  );
};

export default WalletOperations;
