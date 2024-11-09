import { useState } from "react";

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
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  return (
    <div className="w-full h-full">
      {messageHistory.length > 0 ? (
        <ul>
          {messageHistory.map((message, index) => (
            <li key={index}>
              <p>Message: {message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No message history available.</p>
      )}
    </div>
  );
};

export default WalletMessageHistory;
