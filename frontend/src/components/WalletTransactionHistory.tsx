import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import { baseSepolia, sepolia } from "viem/chains";
import Image from "next/image";
import { trimContent } from "@/utils/helper";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface TransactionHistoryProps {
  createdAt: string | Date;
  sealed: boolean;
  direction: "outgoing" | "incoming";
  amountInEth: string;
  transactionHash: string;
  isInternal: boolean;
  nickName?: string | null;
  from: string;
  to: string;
}

interface TransactionProps {
  tx: TransactionHistoryProps;
  chainId: number;
  networkToEtherscanPrefix: (chainId: number) => string;
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
        toast.error(
          `Error fetching transaction history: ${JSON.stringify(error)}`,
          {
            position: "bottom-right",
          }
        );
      }
    };

    fetchTransactionHistory();
  }, [selectedWallet, interactionToggle, apiClient, chainId]);

  const renderTransactionStatus = ({
    tx,
    chainId,
    networkToEtherscanPrefix,
  }: TransactionProps) => {
    const txDirection = tx.direction === "outgoing" ? "to" : "from";
    const counterPartName = trimContent(
      tx?.nickName ? tx.nickName : tx.direction === "outgoing" ? tx.to : tx.from
    );

    console.log("counterPartName", counterPartName);

    return (
      <div
        className={`flex flex-col space-y-2 p-4 border-b border-gray-200 w-full h-full ${
          tx.isInternal ? "bg-green-100" : ""
        }`}
      >
        <div className="flex-1">
          <p className="text-xs text-gray-500">
            {new Date(tx.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p
            className={`text-xs ${
              tx.sealed ? "text-green-500" : "text-red-500"
            }`}
          >
            {tx.sealed ? "Sealed" : "Pending"}
          </p>
          <p className="text-xs text-gray-600">
            {`${txDirection}: ${counterPartName}`}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">
            {tx.direction === "outgoing" ? "-" : "+"}
            {tx.amountInEth} ETH
          </p>
          <a
            href={`${networkToEtherscanPrefix(chainId)}${tx.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Etherscan"
          >
            <Image
              src="/icons/etherscan.svg"
              alt="redirect"
              width={24}
              height={24}
              className="w-6 h-6 cursor-pointer ml-2"
            />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      {transactionHistory.length > 0 ? (
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          {transactionHistory.map((tx, index) => (
            <div
              key={index}
              className="flex items-stretch w-full border-b border-gray-200"
            >
              {renderTransactionStatus({
                tx,
                chainId,
                networkToEtherscanPrefix,
              })}
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
