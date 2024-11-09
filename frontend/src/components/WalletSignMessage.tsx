import { useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import WalletMessageHistory from "./WalletMessageHistory";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletSignMessageProps {
  selectedWallet: CustodialWallet;
  interactionToggle: boolean;
  setInteractionToggle: (value: boolean) => void;
}

const WalletSignMessage: React.FC<WalletSignMessageProps> = ({
  selectedWallet,
  interactionToggle,
  setInteractionToggle,
}) => {
  const apiClient = useAuthenticatedApiClient();
  const [message, setMessage] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);

  const handleSignMessage = async () => {
    if (!message) {
      toast.error("Please enter a message to sign");
      return;
    }

    if (!selectedWallet?.address) {
      toast.error("Unable to sign message without an address");
      return;
    }

    try {
      const response = await apiClient.post("/custodial/wallet/signMessage", {
        address: selectedWallet.address,
        message,
      });
      setSignedMessage(response.data.signature);
      toast.success(
        `Signed Message "${response.data.message}" with wallet ${response.data.address}`
      );

      setInteractionToggle(!interactionToggle);
    } catch (error: any) {
      if (error.response.status === 400 || error.response.status === 404) {
        toast.error(
          `Error sending transaction: ${error.response.data.message}`
        );
      } else {
        toast.error(`Error sending transaction: ${error}`);
      }
    }
  };

  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-bold mb-4">{selectedWallet.nickName}</h3>
      <h3 className="text-lg font-bold mb-2">Sign A Message</h3>

      <input
        type="text"
        placeholder="Enter message to sign"
        value={message || ""}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out mb-4"
      />
      <button
        onClick={handleSignMessage}
        className="px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
      >
        Sign Message
      </button>

      {signedMessage && (
        <div className="mt-4 p-2 bg-gray-100 rounded-md border border-gray-300">
          <p className="text-sm font-medium text-gray-800">Signed Message:</p>
          <p className="text-sm text-gray-600 break-words">{signedMessage}</p>
        </div>
      )}

      <WalletMessageHistory
        interactionToggle={interactionToggle}
        selectedWallet={selectedWallet}
      />
    </div>
  );
};

export default WalletSignMessage;
