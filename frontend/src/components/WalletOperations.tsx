import { useState } from "react";
import WalletTransactionHistory from "./WalletTransactionHistory";
import WalletSignMessage from "./WalletSignMessage";
import WalletSendTransaction from "./WalletSendTransaction";
import Image from "next/image";

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
  custodialWallets: CustodialWallet[];
}

const WalletOperations: React.FC<WalletOperationsProps> = ({
  selectedWallet,
  chainId,
  interactionToggle,
  setInteractionToggle,
  custodialWallets,
}) => {
  const [activeOperation, setActiveOperation] = useState<string>("history");

  const SignMessageComponent = () => {
    return (
      <div
        className="relative group"
        onClick={() => setActiveOperation("signMessage")}
      >
        <Image
          src="/icons/sign.svg"
          alt="sign"
          width={24}
          height={24}
          className="w-6 h-6 cursor-pointer"
        />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Sign Message
        </div>
      </div>
    );
  };

  const SendTransactionComponent = () => {
    return (
      <div
        className="relative group"
        onClick={() => setActiveOperation("sendTransaction")}
      >
        <Image
          src="/icons/transaction.svg"
          alt="transaction"
          width={24}
          height={24}
          className="w-6 h-6 cursor-pointer"
        />

        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Send Transaction
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-lg w-1/4 ml-6 space-y-4">
      <div className="flex p-2 justify-between">
        <SignMessageComponent />
        <SendTransactionComponent />
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
            custodialWallets={custodialWallets}
          />
        </div>
      )}
    </div>
  );
};

export default WalletOperations;
