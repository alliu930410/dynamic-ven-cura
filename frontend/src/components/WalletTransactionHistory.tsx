import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import { baseSepolia, sepolia } from "viem/chains";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletTransactionHistoryProps {
  chainId: number;
  selectedWallet: CustodialWallet;
  interactionToggle: boolean;
}

const WalletTransactionHistory: React.FC<WalletTransactionHistoryProps> = ({
  selectedWallet,
  chainId,
  interactionToggle,
}) => {
  const apiClient = useAuthenticatedApiClient();
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  const networkToEtherscanPrefix = (chainId: number) => {
    switch (chainId) {
      case sepolia.id:
        return "https://sepolia.etherscan.io/tx/";
      case baseSepolia.id:
        return "https://sepolia.basescan.org/tx/";
      default:
        return "https://sepolia.etherscan.io/tx/";
    }
  };

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await apiClient.get(
          `/custodial/wallet/transactions/${chainId}/${selectedWallet.address}`
        );
        setTransactionHistory(response.data);
      } catch (error: any) {
        toast.error("Error fetching data:", error);
      }
    };

    fetchTransactionHistory();
  }, [selectedWallet, interactionToggle, apiClient, chainId]);

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center mt-2">
      {transactionHistory.length > 0 ? (
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          {transactionHistory.map((tx, index) => (
            <div
              key={index}
              className="flex items-center p-4 border-b border-gray-200"
            >
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="font-semibold text-gray-800 truncate">
                  {tx.message}
                </p>
                {tx.sealed ? (
                  <p className="text-xs text-green-500">Sealed</p>
                ) : (
                  <p className="text-xs text-red-500">Pending</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  {tx.from.toLowerCase() ===
                  selectedWallet.address.toLowerCase()
                    ? "-"
                    : "+"}
                  {tx.amountInEth} ETH
                </p>
                <a
                  href={`${networkToEtherscanPrefix(chainId)}${
                    tx.transactionHash
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${networkToEtherscanPrefix(chainId)}${
                    tx.transactionHash
                  }`}
                >
                  <img
                    src="/icons/etherscan.svg"
                    alt="redirect"
                    className="w-6 h-6 cursor-pointer ml-2"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No transaction history available.
        </p>
      )}
    </div>
  );
};

export default WalletTransactionHistory;
