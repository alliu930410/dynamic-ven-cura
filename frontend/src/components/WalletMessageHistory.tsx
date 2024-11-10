import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { trimContent } from "@/utils/helper";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletMessageHistoryProps {
  selectedWallet: CustodialWallet;
  interactionToggle: boolean;
}

const WalletMessageHistory: React.FC<WalletMessageHistoryProps> = ({
  selectedWallet,
  interactionToggle,
}) => {
  const apiClient = useAuthenticatedApiClient();
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const response = await apiClient.get(
          `/custodial/wallet/messages/${selectedWallet.address}`
        );
        setMessageHistory(response.data.items);
      } catch (error: any) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMessageHistory();
  }, [selectedWallet, interactionToggle, apiClient]);

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center mt-2">
      {messageHistory.length > 0 ? (
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          {messageHistory.map((message, index) => (
            <div
              key={index}
              className="flex items-start p-4 border-b border-gray-200"
            >
              <div className="flex-1">
                <p className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="font-semibold text-gray-800 truncate">
                  {trimContent(message.message, 32)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No message history available.
        </p>
      )}
    </div>
  );
};

export default WalletMessageHistory;
