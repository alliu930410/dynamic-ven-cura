import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";

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
  }, [selectedWallet, interactionToggle]);

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
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {tx.from.toLowerCase() ===
                  selectedWallet.address.toLowerCase()
                    ? "-"
                    : "+"}
                  {tx.value} ETH
                </p>
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
