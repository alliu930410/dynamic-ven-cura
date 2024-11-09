import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletMessageHistoryProps {
  selectedWallet: CustodialWallet;
}

const WalletMessageHistory: React.FC<WalletMessageHistoryProps> = ({
  selectedWallet,
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
  }, []);

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      {messageHistory.length > 0 ? (
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 border-b p-4">
            Message History
          </h2>
          <ul className="divide-y divide-gray-200">
            {messageHistory.map((message, index) => (
              <li key={index} className="p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Message:</span> {message.message}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-bold">Signed:</span>{" "}
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
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
