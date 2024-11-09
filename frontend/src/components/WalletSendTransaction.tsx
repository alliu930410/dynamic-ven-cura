import { useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import WalletMessageHistory from "./WalletMessageHistory";
import { isAddress } from "viem";
import WalletTransactionHistory from "./WalletTransactionHistory";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletSendTransactionProps {
  chainId: number;
  selectedWallet: CustodialWallet;
}

const WalletSendTransaction: React.FC<WalletSendTransactionProps> = ({
  chainId,
  selectedWallet,
}) => {
  const apiClient = useAuthenticatedApiClient();
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number | null>(null);

  const handleSendTransaction = async () => {
    if (!recipientAddress) {
      toast.error("Missing recipient");
      return;
    }

    if (!isAddress(recipientAddress)) {
      toast.error(`Invalid recipient address: ${recipientAddress}`);
      return;
    }

    if (Number(amount) == 0 || !amount) {
      toast.error("Missing amount");
      return;
    }

    if (!selectedWallet?.address) {
      toast.error("Unable to send transaction without an address");
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
      toast.success(
        `Transaction submitted: send "${response.data.amountInEth}" value with wallet ${response.data.address} to ${response.data.to}`
      );
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
      <h3 className="text-lg font-bold mb-2">Send A Transaction</h3>

      <input
        type="text"
        placeholder="Enter recipient"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out mb-4"
      />
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
      />
    </div>
  );
};

export default WalletSendTransaction;