import { useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import { isAddress } from "viem";
import WalletTransactionHistory from "./WalletTransactionHistory";
import { baseSepolia, sepolia } from "viem/chains";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletSendTransactionProps {
  chainId: number;
  selectedWallet: CustodialWallet;
  interactionToggle: boolean;
  setInteractionToggle: (value: boolean) => void;
  custodialWallets: CustodialWallet[];
}

const chainIdToNativeTokenName: Record<number, string> = {
  [sepolia.id]: sepolia.nativeCurrency.name,
  [baseSepolia.id]: baseSepolia.nativeCurrency.name,
};

const WalletSendTransaction: React.FC<WalletSendTransactionProps> = ({
  chainId,
  selectedWallet,
  interactionToggle,
  setInteractionToggle,
  custodialWallets,
}) => {
  const apiClient = useAuthenticatedApiClient();
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number | null>(null);
  const [isCustomAddress, setIsCustomAddress] = useState<boolean>(false);

  const handleSendTransaction = async () => {
    if (!recipientAddress) {
      toast.error("Missing recipient", {
        position: "bottom-right",
      });
      return;
    }

    if (!isAddress(recipientAddress)) {
      toast.error(`Invalid recipient address: ${recipientAddress}`, {
        position: "bottom-right",
      });
      return;
    }

    if (Number(amount) == 0 || !amount) {
      toast.error("Missing amount", {
        position: "bottom-right",
      });
      return;
    }

    if (!selectedWallet?.address) {
      toast.error("Unable to send transaction without an address", {
        position: "bottom-right",
      });
      return;
    }

    try {
      const response = await apiClient.post(
        "/custodial/wallet/sendTransaction",
        {
          chainId,
          address: selectedWallet.address,
          to: recipientAddress,
          amountInEth: Number(amount),
        }
      );
      setTransactionHash(response.data.transactionHash);
      setNonce(response.data.nonce);
      console.log(response.data);
      toast.success(
        `Transaction submitted: send ${response.data.amountInEth} ${
          chainIdToNativeTokenName[chainId]
        } with wallet ${response.data?.nickName || response.data.address} to ${
          response.data.to
        }`,
        {
          position: "bottom-right",
        }
      );
      setInteractionToggle(!interactionToggle);
    } catch (error: any) {
      if (error.response.status === 400 || error.response.status === 404) {
        toast.error(
          `Error sending transaction: ${error.response.data.message}`,
          {
            position: "bottom-right",
          }
        );
      } else {
        toast.error(`Error sending transaction: ${error}`, {
          position: "bottom-right",
        });
      }
    }
  };

  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-bold mb-2">Send A Transaction</h3>

      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === "custom") {
            setRecipientAddress("");
            setIsCustomAddress(true);
          } else {
            setRecipientAddress(value);
            setIsCustomAddress(false);
          }
        }}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out mb-4"
      >
        <option value="">Select recipient</option>
        {custodialWallets
          .filter((wallet) => wallet.address !== selectedWallet.address)
          .map((wallet) => (
            <option key={wallet.address} value={wallet.address}>
              {wallet.nickName}
            </option>
          ))}
        <option value="custom">Enter custom address</option>
      </select>
      {isCustomAddress && (
        <input
          type="text"
          placeholder="Enter recipient address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="w-full p-2 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        />
      )}
      <input
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => {
          const value = e.target.value;
          // Regular expression to allow only numbers with up to 6 decimal places
          const regex = /^\d*\.?\d{0,6}$/;

          if (regex.test(value) || value === "") {
            setAmount(value);
          }
        }}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out mb-4"
      />
      <button
        onClick={handleSendTransaction}
        className="px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
      >
        Send Transaction
      </button>

      {transactionHash && (
        <div className="mt-4 p-2 bg-gray-100 rounded-md border border-gray-300">
          <p className="text-sm font-medium text-gray-800">Sent Transaction:</p>
          <p className="text-sm text-gray-600 break-words">{transactionHash}</p>
          <p className="text-sm text-gray-600 break-words">nonce: {nonce}</p>
        </div>
      )}

      <WalletTransactionHistory
        chainId={chainId}
        selectedWallet={selectedWallet}
        interactionToggle={interactionToggle}
      />
    </div>
  );
};

export default WalletSendTransaction;
